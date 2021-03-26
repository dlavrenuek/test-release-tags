import * as core from '@actions/core';
import { getConfig } from './config';
import { getCommits } from './git';
import { generateChangelog } from './changelog';
import path from 'path';

/*
(async () => {
  const commits = await getCommits({
    from: 'v123',
    to: 'HEAD',
  });

  //console.log(commits.filter((commit) => commit.notes.length > 0)[2].notes);
  console.log(commits);

  const changelog = generateChangelog({
    commits,
    issuesUrl: 'https://github.com/some/repo/issues/',
    typeLabels: [
      {
        title: 'Breaking!',
        types: ['breaking'],
      },
      {
        title: 'Cool features',
        types: ['feat'],
      },
      {
        title: 'other',
        types: ['fix', 'chore'],
      },
    ],
    bumpLabels: [
      {
        title: 'major',
        types: ['breaking'],
      },
      {
        title: 'minor',
        types: ['feat'],
      },
      {
        title: 'patch',
        types: [],
      },
    ],
  });

  console.log(changelog.body);
})();
*/

const run = async () => {
  try {
    const from = core.getInput('from');
    const to = core.getInput('to');
    const configFile =
      core.getInput('config-file') ||
      path.join(__dirname, 'defaultConfig.json');
    core.debug(`from         : ${from}`);
    core.debug(`to           : ${to}`);
    core.debug(`config-file  : ${configFile}`);

    const config = getConfig(configFile);
    const commits = await getCommits({ from, to });
    const { body, bump } = generateChangelog({
      commits,
      ...config,
      issuesUrl: '',
    });

    core.setOutput('body', body);
    core.setOutput('bump', bump);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
