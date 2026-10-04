import fs from "fs";
import path from "path";

const COLS = 53;
const ROWS = 7;

const CELL = 12;
const GAP = 3;

const WIDTH = COLS * (CELL + GAP);
const HEIGHT = ROWS * (CELL + GAP);

// --------------------------------------------------
// Fake contribution data pour notre premier test
// --------------------------------------------------

const grid = [];

for (let row = 0; row < ROWS; row++) {
    const currentRow = [];

    for (let col = 0; col < COLS; col++) {
        currentRow.push(Math.random() > 0.65);
    }

    grid.push(currentRow);
}

// --------------------------------------------------
// SVG
// --------------------------------------------------

let svg = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${WIDTH}"
    height="${HEIGHT}"
    viewBox="0 0 ${WIDTH} ${HEIGHT}"
>

<rect
    width="100%"
    height="100%"
    fill="#0d1117"
/>
`;

// --------------------------------------------------
// Contribution squares
// --------------------------------------------------

for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

        const x = col * (CELL + GAP);
        const y = row * (CELL + GAP);

        const active = grid[row][col];

        svg += `
        <rect
            x="${x}"
            y="${y}"
            width="${CELL}"
            height="${CELL}"
            rx="2"
            fill="${active ? "#39d353" : "#161b22"}"
        />
        `;
    }
}

// --------------------------------------------------
// Chemin de Clochette
// --------------------------------------------------

let pathData = "";

for (let col = 0; col < COLS; col++) {

    if (col % 2 === 0) {

        // haut → bas

        for (let row = 0; row < ROWS; row++) {

            const x = col * (CELL + GAP) + CELL / 2;
            const y = row * (CELL + GAP) + CELL / 2;

            pathData += `${pathData ? " L" : "M"} ${x} ${y}`;
        }

    } else {

        // bas → haut

        for (let row = ROWS - 1; row >= 0; row--) {

            const x = col * (CELL + GAP) + CELL / 2;
            const y = row * (CELL + GAP) + CELL / 2;

            pathData += `${pathData ? " L" : "M"} ${x} ${y}`;
        }
    }
}

// --------------------------------------------------
// Path invisible
// --------------------------------------------------

svg += `
<path
    id="clochette-path"
    d="${pathData}"
    fill="none"
    stroke="none"
/>
`;

// --------------------------------------------------
// Clochette
// --------------------------------------------------

const imagePath = path.resolve("assets/clochette.png");

const imageBase64 = fs.readFileSync(imagePath).toString("base64");

svg += `
<image
    href="data:image/png;base64,${imageBase64}"
    width="35"
    height="35"
    x="-17.5"
    y="-17.5"
>
    <animateMotion
        dur="20s"
        repeatCount="indefinite"
        rotate="auto"
    >
        <mpath href="#clochette-path"/>
    </animateMotion>
</image>
`;

// --------------------------------------------------
// Close SVG
// --------------------------------------------------

svg += `
</svg>
`;

// --------------------------------------------------
// Write file
// --------------------------------------------------

fs.mkdirSync("dist", { recursive: true });

fs.writeFileSync(
    "dist/clochette.svg",
    svg
);

console.log("✅ Clochette graph generated!");