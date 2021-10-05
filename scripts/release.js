const util = require("util");
const executeProcess = util.promisify(require('child_process').exec);
const executeProcessInline = require('child_process').spawnSync;

async function updateVersion(updateType) {
  const process = await executeProcess(`npm version ${updateType} --force`);
  return process.stdout;
}

const main = async () => {
  const updateType = process.argv[2]
  const message = process.argv[3].trim()

  const commandHelpMessage = `use o comando da seguinte forma: yarn release [patch| minor| major] [message]`;

  if (!message) {
    console.error(commandHelpMessage);
    process.exit();
  }

  if (updateType !== "minor" && updateType !== "major" && updateType !== "patch"){
    console.error(commandHelpMessage);
    process.exit();
  }

  const newVersion = await updateVersion(updateType)

  await executeProcessInline('git', ['checkout', 'develop'], { stdio: 'inherit' });
  await executeProcessInline('git', ['add', '.'], { stdio: 'inherit' });
  await executeProcessInline('git', ['commit', '-m', message], { stdio: 'inherit' });


  const releaseBranchName = `release/${newVersion}`.trim();
  await executeProcessInline('git', ['checkout', '-b', releaseBranchName], { stdio: 'inherit' });
  await executeProcessInline('git', ['push', 'origin', releaseBranchName], { stdio: 'inherit' });
  

  await executeProcessInline('git', ['checkout', 'develop'], { stdio: 'inherit' });
  await executeProcessInline('git', ['pull', 'origin', releaseBranchName], { stdio: 'inherit' });
  await executeProcessInline('git', ['push', 'origin', 'develop'], { stdio: 'inherit' });

  console.log('script executado com sucesso!');
};

main();