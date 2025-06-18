const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const previewContainer = document.getElementById('preview-container');

const IAB_SIZES = [
  [300, 250], [728, 90], [160, 600], [300, 600],
  [970, 250], [336, 280], [320, 50], [300, 50],
  [468, 60], [250, 250], [200, 200], [120, 600],
  [180, 150], [234, 60]
];

const toggleBtn = document.getElementById('theme-toggle');
toggleBtn.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  toggleBtn.textContent = next === 'dark' ? 'Light Mode' : 'Dark Mode';
});

dropArea.addEventListener('click', () => fileElem.click());
dropArea.addEventListener('dragover', e => {
  e.preventDefault();
  dropArea.classList.add('dragover');
});
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileElem.addEventListener('change', () => handleFiles(fileElem.files));

async function handleFiles(files) {
  previewContainer.innerHTML = '';
  for (const file of files) {
    if (file.name.endsWith('.zip')) {
      await previewZipFile(file);
    } else {
      alert('Only ZIP files are supported');
    }
  }
}

async function previewZipFile(file) {
  const zip = new JSZip();
  try {
    const content = await zip.loadAsync(file);
    const blobUrlMap = {};
    const filePromises = Object.keys(content.files).map(async fileName => {
      const fileObj = content.files[fileName];
      if (!fileObj.dir) {
        const data = await fileObj.async('blob');
        const url = URL.createObjectURL(data);
        blobUrlMap[fileName] = url;
      }
    });
    await Promise.all(filePromises);

    const htmlFileName = Object.keys(content.files).find(name => name.endsWith('.html'));
    if (!htmlFileName) {
      alert('No HTML file found inside ZIP: ' + file.name);
      return;
    }
    const htmlFile = content.files[htmlFileName];
    let htmlContent = await htmlFile.async('text');
    const originalHtml = htmlContent;

    htmlContent = htmlContent.replace(/(src|href)=["']([^"']+)["']/g, (match, attr, url) => {
      if (url.startsWith('http') || url.startsWith('//')) return match;
      let normalizedUrl = url.replace(/^\.\//, '').replace(/^\//, '');
      return blobUrlMap[normalizedUrl] ? `${attr}="${blobUrlMap[normalizedUrl]}"` : match;
    });

    const iframe = document.createElement('iframe');
    const iframeWrapper = document.createElement('div');
    iframeWrapper.className = 'responsive-iframe-wrapper';

    const previewBox = document.createElement('div');
    previewBox.className = 'preview-box';

    iframeWrapper.appendChild(iframe);
    previewBox.appendChild(iframeWrapper);

    const info = document.createElement('div');
    info.className = 'file-info';
    info.textContent = `File: ${file.name} — ${(file.size / 1024).toFixed(1)} KB`;
    previewBox.appendChild(info);

    const checklist = document.createElement('ul');
    checklist.className = 'checklist';
    previewBox.appendChild(checklist);

    previewContainer.appendChild(previewBox);

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const width = doc.body.scrollWidth || 0;
        const height = doc.body.scrollHeight || 0;

        iframeWrapper.style.width = width + 'px';
        iframeWrapper.style.height = height + 'px';

        runChecks(checklist, {
          size: file.size,
          width,
          height,
          html: originalHtml
        });

      } catch (e) {
        console.warn('Could not inspect iframe content.', e);
      }
    };

    const blob = new Blob([htmlContent], { type: 'text/html' });
    iframe.src = URL.createObjectURL(blob);

  } catch (error) {
    alert('Error reading ZIP file: ' + file.name);
    console.error(error);
  }
}

function runChecks(list, { size, width, height, html }) {
  const sizeCheck = size <= 150 * 1024;
  addCheck(list, `File size ≤ 150KB`, sizeCheck);

  const isIAB = IAB_SIZES.some(([w, h]) => w === width && h === height);
  addCheck(list, `Rendered size matches IAB standard (${width}x${height})`, isIAB);

  const hasClickTag = /clickTag/.test(html) || /window\.clickTag/.test(html);
  addCheck(list, `clickTag present`, hasClickTag);

  const adSizeCheck = validateAdSizeMeta(html);
  addCheck(list, `Meta tag matches IAB size (${adSizeCheck.message})`, adSizeCheck.valid);
}

function validateAdSizeMeta(html) {
  const match = html.match(/<meta\s+name=["']ad.size["']\s+content=["']([^"']+)["']/i);
  if (!match) return { valid: false, message: 'meta tag missing' };

  const content = match[1];
  const params = Object.fromEntries(content.split(',').map(pair => {
    const [key, val] = pair.trim().split('=');
    return [key.trim(), parseInt(val, 10)];
  }));

  const width = params.width;
  const height = params.height;

  if (!width || !height) return { valid: false, message: 'invalid width/height' };

  const isMatch = IAB_SIZES.some(([w, h]) => w === width && h === height);
  return {
    valid: isMatch,
    message: isMatch ? `${width}x${height}` : `${width}x${height} not IAB`
  };
}

function addCheck(list, label, passed) {
  const li = document.createElement('li');
  li.textContent = (passed ? '✅ ' : '❌ ') + label;
  li.className = passed ? 'pass' : 'fail';
  list.appendChild(li);
}
