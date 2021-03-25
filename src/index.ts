import simpleGit from 'simple-git';
import {
  Message,
  parser,
  toConventionalChangelogFormat,
} from '@conventional-commits/parser';
import conventionalChangelogWriter from 'conventional-changelog-writer';

const git = simpleGit();

(async () => {
  const log = await git.log({
    from: 'v123',
    to: 'HEAD',
  });
  const parsed = log.all.map(({ message, body, ...commit }) => {
    try {
      return parser(`${message}${body && `\n${body}`}`);
    } catch (e) {
      console.log('Message could not be parsed', message);
    }
    return null;
  });
  const commits = parsed
    .filter((ast): ast is Message => ast !== null)
    .map(toConventionalChangelogFormat);

  // @ts-ignore
  const changelog = conventionalChangelogWriter.parseArray(commits);

  console.log(changelog);

  console.log(await git.listConfig());
})();
