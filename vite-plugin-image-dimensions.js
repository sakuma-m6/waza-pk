import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { parse } from 'node-html-parser';

// 画像のキャッシュ
const imageCache = new Map();
// プロジェクト全体で使う代表画像のサイズ（PC画像を優先）
let globalDefaultDimensions = null;

// 画像サイズを取得
async function getImageDimensions(imagePath) {
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath);
  }

  try {
    const buffer = await fs.readFile(imagePath);
    const meta = await sharp(buffer).metadata();
    const dimensions = { width: meta.width, height: meta.height };
    imageCache.set(imagePath, dimensions);
    return dimensions;
  } catch (e) {
    return null;
  }
}

export default function imageDimensionPlugin() {
  return {
    name: 'vite-plugin-image-dimensions',
    apply: 'build',
    enforce: 'pre', // Svelteコンパイルの前に実行

    // Svelteファイルを変換してimgタグにwidth/heightを追加
    async transform(code, id) {
      // .svelteファイルのみ対象
      if (!id.endsWith('.svelte')) return null;

      // imgタグがない場合はスキップ
      if (!code.includes('<img')) return null;

      console.log(`\n🔍 処理: ${path.basename(id)}`);
      let modified = code;

      // 画像配列を抽出（例: images={[ { pc: 'path.webp', sp: 'path.webp' } ]}）
      const imageArrayMatch = code.match(/images=\{?\[([^\]]+)\]\}?/);
      let defaultDimensions = null;

      if (imageArrayMatch) {
        // 最初のpc画像のパスを抽出
        const firstPcMatch = imageArrayMatch[1].match(/pc:\s*['"]([^'"]+)['"]/);
        if (firstPcMatch) {
          const firstImagePath = path.resolve('public', firstPcMatch[1]);
          try {
            defaultDimensions = await getImageDimensions(firstImagePath);
            console.log(`  📐 代表画像: ${firstPcMatch[1]} (${defaultDimensions.width}x${defaultDimensions.height})`);

            // グローバル変数に保存（まだ設定されていない場合）
            if (!globalDefaultDimensions) {
              globalDefaultDimensions = defaultDimensions;
              console.log(`  🌐 グローバル代表サイズとして保存しました`);
            }
          } catch (e) {
            console.log(`  ⚠️  代表画像の読み込み失敗: ${firstPcMatch[1]}`);
          }
        }
      }

      // ローカルの代表サイズがなければグローバルを使用
      if (!defaultDimensions && globalDefaultDimensions) {
        defaultDimensions = globalDefaultDimensions;
        console.log(`  🌐 グローバル代表サイズを使用: ${defaultDimensions.width}x${defaultDimensions.height}`);
      }

      // imgタグを検索（自己閉じタグ対応）
      const imgRegex = /<img\s+([^>]*?)\s*\/?>/gi;
      const matches = [...code.matchAll(imgRegex)];
      let processedCount = 0;

      console.log(`  🔎 imgタグ検出: ${matches.length}個`);

      for (const match of matches) {
        const fullTag = match[0];
        const attributes = match[1].trim();

        // すでにwidth/heightが指定されている場合はスキップ
        if (attributes.includes('width=') && attributes.includes('height=')) {
          console.log(`  ⏭️  スキップ（既存）: ${fullTag.slice(0, 50)}...`);
          continue;
        }

        // src属性を抽出
        const srcMatch = attributes.match(/src=["']([^"'{}]+)["']/);
        let dimensions = null;
        let srcInfo = '';

        if (srcMatch) {
          const src = srcMatch[1];
          srcInfo = src;

          // 外部URLの場合はスキップ
          if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            console.log(`  ⏭️  スキップ（外部URL）: ${src}`);
            continue;
          }

          // publicディレクトリ内の画像パスを解決
          const imagePath = path.resolve('public', src);

          try {
            dimensions = await getImageDimensions(imagePath);
            console.log(`  ✅ 通常画像: ${src} (${dimensions.width}x${dimensions.height})`);
          } catch (e) {
            console.log(`  ❌ 読み込み失敗: ${src}`);
          }
        } else {
          // Svelte変数を含むsrc属性の場合（{image.pc}など）
          const svelteVarMatch = attributes.match(/src=["']\{([^}]+)\}["']/);
          if (svelteVarMatch) {
            srcInfo = `{${svelteVarMatch[1]}}`;
            if (defaultDimensions) {
              console.log(`  ✅ Svelte変数: ${srcInfo} → 代表サイズ適用 (${defaultDimensions.width}x${defaultDimensions.height})`);
              dimensions = defaultDimensions;
            } else {
              console.log(`  ❌ Svelte変数: ${srcInfo} → 代表画像なし`);
            }
          }
        }

        if (dimensions) {
          // 自己閉じタグかどうか判定
          const isSelfClosing = fullTag.endsWith('/>');
          // 新しいタグを作成（既存の属性 + width/height）
          const newTag = isSelfClosing
            ? `<img ${attributes} width="${dimensions.width}" height="${dimensions.height}" />`
            : `<img ${attributes} width="${dimensions.width}" height="${dimensions.height}">`;
          modified = modified.replace(fullTag, newTag);
          processedCount++;
        }
      }

      if (processedCount > 0) {
        console.log(`  ✨ ${processedCount}個の画像にwidth/heightを追加しました\n`);
      }

      return modified !== code ? { code: modified, map: null } : null;
    },

    // HTMLファイルにもwidth/heightを追加
    async generateBundle(_, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith('.html')) continue;

        const chunk = bundle[fileName];
        let html = chunk.source;
        const root = parse(html, { comment: true });
        const imgTags = root.querySelectorAll('img');

        for (const img of imgTags) {
          const src = img.getAttribute('src');
          if (!src || (img.getAttribute('width') && img.getAttribute('height'))) continue;

          const imgPath = path.resolve('dist', src);
          const dimensions = await getImageDimensions(imgPath);

          if (dimensions) {
            img.setAttribute('width', dimensions.width);
            img.setAttribute('height', dimensions.height);
          }
        }

        chunk.source = root.childNodes.map(n => n.toString()).join('');
      }
    }
  };
}
