const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');
const pngToIco = require('png-to-ico');

const root = path.join(__dirname, '..');
const source = path.join(root, 'Helldivers-2-Logo.png.png');
const outDir = path.join(root, 'build');
const pngOut = path.join(outDir, 'icon.png');
const icoOut = path.join(outDir, 'icon.ico');

fs.mkdirSync(outDir, { recursive: true });

const input = PNG.sync.read(fs.readFileSync(source));
const side = Math.min(input.width, input.height);
const offsetX = Math.floor((input.width - side) / 2);
const offsetY = Math.floor((input.height - side) / 2);
const output = new PNG({ width: side, height: side });

for (let y = 0; y < side; y += 1) {
  for (let x = 0; x < side; x += 1) {
    const srcIdx = ((y + offsetY) * input.width + (x + offsetX)) << 2;
    const dstIdx = (y * side + x) << 2;
    output.data[dstIdx] = input.data[srcIdx];
    output.data[dstIdx + 1] = input.data[srcIdx + 1];
    output.data[dstIdx + 2] = input.data[srcIdx + 2];
    output.data[dstIdx + 3] = input.data[srcIdx + 3];
  }
}

fs.writeFileSync(pngOut, PNG.sync.write(output));

pngToIco(pngOut).then((buffer) => {
  fs.writeFileSync(icoOut, buffer);
  console.log(`Created ${path.relative(root, pngOut)} and ${path.relative(root, icoOut)}`);
});
