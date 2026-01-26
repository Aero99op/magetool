const electronInstaller = require('electron-winstaller');
const path = require('path');

async function build() {
    console.log('Creating Windows Installer...');
    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: path.join(__dirname, 'Magetool-win32-x64'),
            outputDirectory: path.join(__dirname, 'installer'),
            authors: 'Spandan',
            exe: 'Magetool.exe',
            name: 'Magetool',
            description: 'Magetool Desktop App',
            noMsi: true,
            version: '1.0.0'
        });
        console.log('Installer created successfully in "installer_output" folder!');
    } catch (e) {
        console.log(`No dice: ${e.message}`);
    }
}

build();
