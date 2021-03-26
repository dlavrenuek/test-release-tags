import simpleGit, { DefaultLogFields } from 'simple-git';
import {
  ConventionalChangelogCommit,
  parser,
  toConventionalChangelogFormat,
} from '@conventional-commits/parser';

const git = simpleGit();

export type Commit = DefaultLogFields & {
  parsed: ConventionalChangelogCommit;
};

type Git = (params: { from: string; to: string }) => Promise<Commit[]>;

export const getCommits: Git = async ({ from, to }) => {
  const log = await git.log({
    from,
    to,
  });
  const parsed = log.all.map(({ message, body, ...commit }) => {
    try {
      return {
        ...commit,
        parsed: toConventionalChangelogFormat(
          parser(`${message}${body && `\n${body}`}`)
        ),
      };
    } catch (e) {
      // unconventional commits are ignored
    }
    return null;
  });
  return parsed.filter((commit): commit is Commit => commit !== null);
};
