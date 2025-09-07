import fs from 'fs-extra'
import path from 'path'

const cockpitConfig = {
    moduleName: 'adguard',
    version: '1.0.0',
    title: 'AdGuard Home',
    description: 'Interface fot control AdGuard Home',
    author: 'Francesco Urso'
}

const buildCockpitModule = async () => {
    try {
        const { build } = await import("vite");

        // Remove the dist and cockpit-module directories if they exist
        await fs.remove("./dist");
        await fs.remove("./cockpit-module");

        // Run the Vite build
        await build();

        // Copy necessary files to cockpit-module directory
        const destDir = "./cockpit-module";
        await fs.ensureDir(destDir);

        // Check and copy files if they exist, otherwise create default ones
        const filesToCopy = [
            { src: "./dist/adguard.js", dest: path.join(destDir, "adguard.js") },
            { src: "./dist/style.css", dest: path.join(destDir, "style.css") },
            { src: "./public/logo.svg", dest: path.join(destDir, "logo.svg") },
        ];

        for (const file of filesToCopy) {
            try {
                if (await fs.pathExists(file.src)) {
                    await fs.copy(file.src, file.dest);
                    console.log(`Copiato: ${file.src} -> ${file.dest}`);
                } else {
                    console.warn(`File non trovato: ${file.src}`);

                    // If style.css does not exist, create a default one
                    if (file.src.endsWith("style.css")) {
                        const cssContent = `/* Style for AdGuard Home */`;
                        await fs.writeFile(file.dest, cssContent);
                        console.log(`Createo style.css di default: ${file.dest}`);
                    }

                    // If logo.svg does not exist, create a default one
                    if (file.src.endsWith("logo.svg")) {
                        const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#68b604"/>
              <path d="M30,30 L70,70 M70,30 L30,70" stroke="white" stroke-width="10"/>
            </svg>`;
                        await fs.writeFile(file.dest, defaultSvg);
                        console.log(`Create logo.svg default: ${file.dest}`);
                    }
                }
            } catch (err) {
                console.error(`Error copying file: ${file.src}:`, err.message);
            }
        }

        // Create manifest.json for Cockpit 137
        const manifest = {
            requires: {
                cockpit: "137",
            },
            tools: {
                adguard: {
                    label: "AdGuard Home",
                    path: "index.html",
                },
            },
        };

        await fs.writeJson(path.join(destDir, "manifest.json"), manifest, {
            spaces: 2,
        });

        // Create index.html for Cockpit 137
        const htmlContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>AdGuard Home</title>
            <link href="../base1/cockpit.css" type="text/css" rel="stylesheet">
            <link href="style.css" type="text/css" rel="stylesheet">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div id="app"></div>
            <script src="../base1/cockpit.js"></script>
            <script src="adguard.js"></script>
            <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        </body>
        </html>`;

        await fs.writeFile(path.join(destDir, "index.html"), htmlContent);

        // Colori ANSI
        const reset = "\x1b[0m";
        const green = "\x1b[32m";
        const cyan = "\x1b[36m";
        const yellow = "\x1b[33m";
        const bold = "\x1b[1m";

        console.log("");
        console.log(green + "SUCCESS!" + reset);
        console.log("---------------------------------------------------------------------------------------");
        console.log(bold + cyan + "### Module Cockpit is built and ready to be installed. ###" + reset);
        console.log("---------------------------------------------------------------------------------------");
        console.log("For installing the module in your system, run the following commands in the terminal:");
        console.log("");
        console.log(yellow + "1." + reset);
        console.log("sudo mkdir -p /usr/share/cockpit/adguard");
        console.log(yellow + "2." + reset);
        console.log("sudo cp -r cockpit-module/* /usr/share/cockpit/adguard/");
        console.log("---------------------------------------------------------------------------------------");
        console.log("If the permission of the files is not correct, run:");
        console.log("sudo chown -R root:root /usr/share/cockpit/adguard");
        console.log("sudo systemctl restart cockpit");
        console.log("---------------------------------------------------------------------------------------");
        console.log("For more details:");
        console.log("🔗 https://github.com/francesco-urso/cockpit-adguardhome");
        console.log("");
    } catch (error) {
        console.error("Error building module: ", error);
    }
}

buildCockpitModule().catch(console.error)