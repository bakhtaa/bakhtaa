import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

const COLS = 53;
const ROWS = 7;

const CELL = 12;
const GAP = 3;

const WIDTH = COLS * (CELL + GAP);
const HEIGHT = ROWS * (CELL + GAP);

const FLIGHT_DURATION = 52;

const MOTION_KEY_TIMES = [
    0,
    0.14,
    0.28,
    0.42,
    0.56,
    0.70,
    0.84,
    1
];

// ============================================================
// COULEURS
// ============================================================

/*const COLORS = {
    empty: "#161b22",

    green1: "#0e4429",
    green2: "#006d32",
    green3: "#26a641",
    green4: "#39d353",

    magic: "#ffe66d",
    magicBright: "#fff7b2",
    magicGlow: "#ffd84d",

    sparkle: "#fff3a6"
};*/
const COLORS = {
empty: "#161b22",


// Aurora greens — deep emerald to luminous mint
green1: "#0B3D35",
green2: "#087F68",
green3: "#20C997",
green4: "#3DFFA8",

// Warm aurora gold — brighter and better balanced with green
magic: "#FFD76A",
magicBright: "#FFF4C2",
magicGlow: "#FFCB45",

// Soft mint-white sparkle
sparkle: "#E8FFF5"


};


// ============================================================
// CHEMIN DE L'IMAGE
// ============================================================

const imagePath = path.join(
    __dirname,
    "../assets/clochette.png"
);

if (!fs.existsSync(imagePath)) {
    throw new Error(
        "❌ Impossible de trouver assets/clochette.png"
    );
}

const imageBase64 = fs
    .readFileSync(imagePath)
    .toString("base64");

// ============================================================
// GENERATION DU GRAPHE
// ============================================================

function randomLevel() {
    const r = Math.random();

    if (r < 0.55) return 0;
    if (r < 0.72) return 1;
    if (r < 0.86) return 2;
    if (r < 0.95) return 3;

    return 4;
}

const grid = [];

for (let row = 0; row < ROWS; row++) {
    const currentRow = [];

    for (let col = 0; col < COLS; col++) {
        currentRow.push(randomLevel());
    }

    grid.push(currentRow);
}

// ============================================================
// POINTS MAGIQUES
// Ces points correspondent aux endroits où Clochette
// traverse réellement la grille.
// ============================================================

const magicCells = [
    { col: 5, row: 5 },
    { col: 11, row: 2 },
    { col: 17, row: 4 },
    { col: 24, row: 1 },
    { col: 30, row: 5 },
    { col: 37, row: 2 },
    { col: 44, row: 4 },
    { col: 49, row: 1 }
];

// ============================================================
// OUTILS
// ============================================================

function cellX(col) {
    return col * (CELL + GAP) + CELL / 2;
}

function cellY(row) {
    return row * (CELL + GAP) + CELL / 2;
}

function levelColor(level) {
    switch (level) {
        case 1:
            return COLORS.green1;
        case 2:
            return COLORS.green2;
        case 3:
            return COLORS.green3;
        case 4:
            return COLORS.green4;
        default:
            return COLORS.empty;
    }
}

// ============================================================
// CHEMIN DE CLOC HETTE
//
// On ne fait PAS un serpent ligne par ligne.
// On crée une trajectoire douce qui traverse la grille.
// ============================================================

const p = magicCells.map((point) => ({
    x: cellX(point.col),
    y: cellY(point.row)
}));

const pathData = `
M ${p[0].x} ${p[0].y}

C
${p[0].x + 18} ${p[0].y - 12},
${p[1].x - 18} ${p[1].y + 12},
${p[1].x} ${p[1].y}

C
${p[1].x + 18} ${p[1].y - 14},
${p[2].x - 18} ${p[2].y + 14},
${p[2].x} ${p[2].y}

C
${p[2].x + 18} ${p[2].y - 12},
${p[3].x - 18} ${p[3].y + 12},
${p[3].x} ${p[3].y}

C
${p[3].x + 18} ${p[3].y + 15},
${p[4].x - 18} ${p[4].y - 15},
${p[4].x} ${p[4].y}

C
${p[4].x + 18} ${p[4].y - 12},
${p[5].x - 18} ${p[5].y + 12},
${p[5].x} ${p[5].y}

C
${p[5].x + 18} ${p[5].y - 14},
${p[6].x - 18} ${p[6].y + 14},
${p[6].x} ${p[6].y}

C
${p[6].x + 18} ${p[6].y - 12},
${p[7].x - 18} ${p[7].y + 12},
${p[7].x} ${p[7].y}
`;

// ============================================================
// DOTS DU GRAPHE
// ============================================================

let dotsSvg = "";

for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {

        const x = col * (CELL + GAP);
        const y = row * (CELL + GAP);

        const level = grid[row][col];
        const id = `dot-${col}-${row}`;


        const magicInfo = getMagicInfo(col, row);

let magicAnimations = "";

if (magicInfo) {

    const startTime = magicInfo.start;
    const endTime = magicInfo.end;

    const startRatio =
        startTime / FLIGHT_DURATION;

    const endRatio =
        endTime / FLIGHT_DURATION;

    /*
     * Le dot devient jaune à l'arrivée de Clochette
     * et reste jaune jusqu'à la fin du trajet.
     */
    magicAnimations = `
        <!--
            Le jaune devient permanent après le passage
            de Clochette.
        -->
        <animate
            attributeName="fill"
            values="
                ${levelColor(level)};
                ${levelColor(level)};
                ${COLORS.magicBright};
                ${COLORS.magicBright}
            "
            keyTimes="
                0;
                ${startRatio.toFixed(4)};
                ${Math.min(
                    startRatio + 0.012,
                    endRatio
                ).toFixed(4)};
                1
            "
            dur="${FLIGHT_DURATION}s"
            repeatCount="indefinite"
        />

        <!--
            Le dot vibre UNIQUEMENT entre l'arrivée
            de Clochette et l'arrivée à la zone suivante.
        -->
        <animateTransform
            attributeName="transform"
            type="translate"
            values="
                0 0;
                0 0;
                -0.8 -0.4;
                0.8 0.5;
                -0.4 0.7;
                0 0;
                0 0
            "
            keyTimes="
                0;
                ${startRatio.toFixed(4)};
                ${(startRatio + (endRatio - startRatio) * 0.25).toFixed(4)};
                ${(startRatio + (endRatio - startRatio) * 0.50).toFixed(4)};
                ${(startRatio + (endRatio - startRatio) * 0.75).toFixed(4)};
                ${endRatio.toFixed(4)};
                1
            "
            dur="${FLIGHT_DURATION}s"
            repeatCount="indefinite"
        />

        <!--
            Petit agrandissement au moment du passage.
        -->
        <animate
            attributeName="width"
            values="
                ${CELL};
                ${CELL};
                ${CELL + 2};
                ${CELL};
                ${CELL}
            "
            keyTimes="
                0;
                ${startRatio.toFixed(4)};
                ${Math.min(
                    startRatio + 0.012,
                    endRatio
                ).toFixed(4)};
                ${Math.min(
                    startRatio + 0.025,
                    endRatio
                ).toFixed(4)};
                1
            "
            dur="${FLIGHT_DURATION}s"
            repeatCount="indefinite"
        />

        <animate
            attributeName="height"
            values="
                ${CELL};
                ${CELL};
                ${CELL + 2};
                ${CELL};
                ${CELL}
            "
            keyTimes="
                0;
                ${startRatio.toFixed(4)};
                ${Math.min(
                    startRatio + 0.012,
                    endRatio
                ).toFixed(4)};
                ${Math.min(
                    startRatio + 0.025,
                    endRatio
                ).toFixed(4)};
                1
            "
            dur="${FLIGHT_DURATION}s"
            repeatCount="indefinite"
        />
    `;
}

        dotsSvg += `
        <rect
             id="${id}"
        x="${x}"
        y="${y}"
        width="${CELL}"
        height="${CELL}"
        rx="2.5"
        fill="${levelColor(level)}"
        opacity="0.95"
        >
            <!-- Petite respiration générale -->
            <animate
                attributeName="opacity"
                values="0.88;1;0.88"
                dur="${4 + ((row + col) % 4)}s"
                begin="${(row + col) * 0.03}s"
                repeatCount="indefinite"
            />

            <!--
                Quand la fée arrive :
                le dot devient lumineux,
                grossit légèrement,
                puis revient à son état normal.
            -->
           ${magicAnimations}
        </rect>
        `;
    }
}

// ============================================================
// CALCUL DU MOMENT OÙ UN DOT RÉAGIT
// ============================================================
//
// On utilise une approximation basée sur la position
// du dot par rapport aux points traversés.
//
// Cela donne l'impression que l'énergie se propage
// autour du passage de Clochette.
// ============================================================
function getMagicInfo(col, row) {

    let closest = Infinity;
    let closestIndex = -1;

    magicCells.forEach((magic, index) => {

        const dx = col - magic.col;
        const dy = row - magic.row;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance <= 2.2) {

            const baseTime =
                MOTION_KEY_TIMES[index]
                * FLIGHT_DURATION;

            if (baseTime < closest) {
                closest = baseTime;
                closestIndex = index;
            }
        }
    });

    if (closestIndex === -1) {
        return null;
    }

    const nextTime =
        closestIndex < magicCells.length - 1
            ? MOTION_KEY_TIMES[closestIndex + 1]
              * FLIGHT_DURATION
            : FLIGHT_DURATION;

    return {
        zoneIndex: closestIndex,
        start: closest,
        end: nextTime
    };
}

// ============================================================
// HALOS AUTOUR DES POINTS MAGIQUES
// ============================================================

let magicEffectsSvg = "";

magicCells.forEach((point, index) => {

    const x = cellX(point.col);
    const y = cellY(point.row);

    const delay =
        (index / (magicCells.length - 1))
        * FLIGHT_DURATION;

    magicEffectsSvg += `
        <!-- Halo -->
        <circle
            cx="${x}"
            cy="${y}"
            r="7"
            fill="none"
            stroke="${COLORS.magic}"
            stroke-width="1"
            opacity="0"
        >
            <animate
                attributeName="r"
                values="4;10;15"
                dur="1.5s"
                begin="${delay.toFixed(2)}s"
                repeatCount="indefinite"
            />

            <animate
                attributeName="opacity"
                values="0;0.8;0"
                dur="1.5s"
                begin="${delay.toFixed(2)}s"
                repeatCount="indefinite"
            />
        </circle>

        <!-- Étoile centrale -->
        <g
            transform="translate(${x}, ${y})"
            opacity="0"
        >
            <path
                d="
                    M 0 -7
                    L 1.5 -1.5
                    L 7 0
                    L 1.5 1.5
                    L 0 7
                    L -1.5 1.5
                    L -7 0
                    L -1.5 -1.5
                    Z
                "
                fill="${COLORS.magicBright}"
            />

            <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.3s"
                begin="${delay.toFixed(2)}s"
                repeatCount="indefinite"
            />

            <animateTransform
                attributeName="transform"
                type="translate"
                additive="sum"
                values="
                    ${x} ${y};
                    ${x} ${y - 2};
                    ${x} ${y}
                "
                dur="1.3s"
                begin="${delay.toFixed(2)}s"
                repeatCount="indefinite"
            />
        </g>
    `;
});

// ============================================================
// PETITES PARTICULES
// ============================================================

let particlesSvg = "";

for (let i = 0; i < 22; i++) {

    const index = i % magicCells.length;
    const point = magicCells[index];

    const x = cellX(point.col);
    const y = cellY(point.row);

    const offsetX = ((i * 17) % 11) - 5;
    const offsetY = ((i * 13) % 9) - 4;

    const delay =
        (index / magicCells.length) * FLIGHT_DURATION
        + (i % 5) * 0.18;

    particlesSvg += `
        <circle
            cx="${x + offsetX}"
            cy="${y + offsetY}"
            r="${1 + (i % 2) * 0.5}"
            fill="${COLORS.sparkle}"
            opacity="0"
        >
            <animate
                attributeName="opacity"
                values="0;0.9;0"
                dur="1.2s"
                begin="${delay.toFixed(2)}s"
                repeatCount="indefinite"
            />

            <animateTransform
                attributeName="transform"
                type="translate"
                values="
                    0 0;
                    ${((i % 3) - 1) * 4} -5;
                    ${((i % 5) - 2) * 6} -9
                "
                dur="1.2s"
                begin="${delay.toFixed(2)}s"
                repeatCount="indefinite"
            />
        </circle>
    `;
}

// ============================================================
// GRANDE PLUIE FINALE
// ============================================================

let finaleSvg = "";

const finaleSparkles = 70;

for (let i = 0; i < finaleSparkles; i++) {

    const col = (i * 17) % COLS;
    const row = (i * 29) % ROWS;

    const x =
        col * (CELL + GAP) + CELL / 2;

    const targetY =
        row * (CELL + GAP) + CELL / 2;

    const startY =
        -10 - ((i * 11) % 70);

    const size =
        0.7 + (i % 4) * 0.35;

    const appear =
        0.90 + (i % 7) * 0.012;

    const impact =
        Math.min(appear + 0.04, 0.98);

    finaleSvg += `
        <g
            transform="translate(${x}, ${startY})"
            opacity="0"
        >

            <circle
                cx="0"
                cy="0"
                r="${size}"
                fill="${COLORS.magicBright}"
            />

            <path
                d="
                    M 0 -3
                    L 0.7 -0.7
                    L 3 0
                    L 0.7 0.7
                    L 0 3
                    L -0.7 0.7
                    L -3 0
                    L -0.7 -0.7
                    Z
                "
                fill="${COLORS.magic}"
            />

            <animate
                attributeName="opacity"
                values="0;0;1;0.9;0"
                keyTimes="
                    0;
                    ${appear.toFixed(3)};
                    ${(appear + 0.02).toFixed(3)};
                    ${impact.toFixed(3)};
                    1
                "
                dur="${FLIGHT_DURATION}s"
                repeatCount="indefinite"
            />

            <animateTransform
                attributeName="transform"
                type="translate"
                values="
                    ${x} ${startY};
                    ${x} ${startY};
                    ${x + ((i % 5) - 2) * 2} ${targetY};
                    ${x} ${targetY}
                "
                keyTimes="
                    0;
                    ${appear.toFixed(3)};
                    ${impact.toFixed(3)};
                    1
                "
                dur="${FLIGHT_DURATION}s"
                repeatCount="indefinite"
            />

        </g>
    `;
}

finaleSvg += `
    <!--
        Flash magique global.
        La grille entière est momentanément baignée
        de lumière jaune.
    -->
    <rect
        x="0"
        y="0"
        width="${WIDTH}"
        height="${HEIGHT}"
        fill="${COLORS.magicBright}"
        opacity="0"
        pointer-events="none"
    >
        <animate
            attributeName="opacity"
            values="0;0;0.08;0.20;0"
            keyTimes="0;0.88;0.92;0.96;1"
            dur="${FLIGHT_DURATION}s"
            repeatCount="indefinite"
        />
    </rect>
`;

// ============================================================
// SVG FINAL
// ============================================================

const svg = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${WIDTH}"
    height="${HEIGHT}"
    viewBox="0 0 ${WIDTH} ${HEIGHT}"
>

    <defs>

        <!--
            Glow doux pour la magie
        -->
        <filter
            id="magic-glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
        >
            <feGaussianBlur
                stdDeviation="2.2"
                result="blur"
            />

            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>

        <!--
            Chemin de déplacement de Clochette
        -->
        <path
            id="clochette-flight"
            d="${pathData}"
            fill="none"
        />

    </defs>

    <!-- =======================================================
         GRAPHE
         ======================================================= -->

    <g id="contribution-grid">
        ${dotsSvg}
    </g>


    <!-- =======================================================
         EFFETS MAGIQUES
         ======================================================= -->

    <g
        id="magic-effects"
        filter="url(#magic-glow)"
    >
        ${magicEffectsSvg}
        ${particlesSvg}
    </g>
  
    <g
    id="finale-magic"
    filter="url(#magic-glow)"
>
    ${finaleSvg}
</g>

    <!-- =======================================================
         CHEMIN DE CLOC HETTE
         INVISIBLE
         ======================================================= -->

    <path
        d="${pathData}"
        fill="none"
        stroke="none"
    />


    <!-- =======================================================
         CLOC HETTE
         
         Groupe extérieur :
         déplacement

         Groupe intérieur :
         flottement naturel
         ======================================================= -->

    <g id="clochette-motion">

        <animateMotion
            dur="${FLIGHT_DURATION}s"
            repeatCount="indefinite"
            rotate="0"
            calcMode="spline"
            keyTimes="
                0;
                0.14;
                0.28;
                0.42;
                0.56;
                0.70;
                0.84;
                1
            "
            keySplines="
                0.42 0 0.58 1;
                0.42 0 0.58 1;
                0.42 0 0.58 1;
                0.42 0 0.58 1;
                0.42 0 0.58 1;
                0.42 0 0.58 1;
                0.42 0 0.58 1
            "
        >
            <mpath href="#clochette-flight" />
        </animateMotion>


        <!--
            Ce groupe flotte légèrement indépendamment
            du déplacement principal.
        -->

        <g id="clochette-float">

            <animateTransform
                attributeName="transform"
                type="translate"
                values="
                    0 0;
                    0 -1.5;
                    0 0;
                    0 1.2;
                    0 0
                "
                dur="3.8s"
                repeatCount="indefinite"
            />


            <!--
                Petit halo très discret autour de la fée.
                Il aide à l'intégrer visuellement dans les dots.
            -->

            <circle
                cx="0"
                cy="0"
                r="15"
                fill="${COLORS.magic}"
                opacity="0.08"
                filter="url(#magic-glow)"
            />


            <!-- IMAGE DE CLOC HETTE -->

            <image
                href="data:image/png;base64,${imageBase64}"
                x="-13"
                y="-13"
                width="36"
                height="36"
                preserveAspectRatio="xMidYMid meet"
            />


            <!--
                Très petite poussière qui accompagne
                directement la fée.
            -->

            <circle
                cx="-9"
                cy="7"
                r="1"
                fill="${COLORS.sparkle}"
                opacity="0.9"
            >
                <animate
                    attributeName="opacity"
                    values="0.2;1;0.2"
                    dur="0.8s"
                    repeatCount="indefinite"
                />
            </circle>

            <circle
                cx="8"
                cy="-6"
                r="0.8"
                fill="${COLORS.sparkle}"
                opacity="0.7"
            >
                <animate
                    attributeName="opacity"
                    values="0.1;0.9;0.1"
                    dur="1.1s"
                    repeatCount="indefinite"
                />
            </circle>

        </g>

    </g>

</svg>
`;

// ============================================================
// ECRITURE
// ============================================================

const distDir = path.join(__dirname, "../dist");

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

const outputPath = path.join(
    distDir,
    "clochette.svg"
);

fs.writeFileSync(
    outputPath,
    svg.trim()
);

console.log(
    `✨ Clochette générée : ${outputPath}`
);