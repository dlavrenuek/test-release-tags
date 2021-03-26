import { Commit } from './git';

const BREAKING_CHANGE_TITLE = 'BREAKING CHANGE';

type IndexedByType = Record<string, Commit[]>;

const indexByType = (commits: Commit[]): IndexedByType =>
  commits.reduce<IndexedByType>((indexed, commit) => {
    const {
      parsed: { type, notes },
    } = commit;
    const hasBreaking =
      type !== 'breaking' && // if type=='breaking' the commit will be already added to the breaking index
      notes.some(({ title }) => title === BREAKING_CHANGE_TITLE);
    const typeArray = [...(indexed[type] || []), commit];
    const breakingArray = [
      ...(indexed.breaking || []),
      ...(hasBreaking ? [commit] : []),
    ];

    return {
      ...indexed,
      breaking: breakingArray,
      [type]: typeArray,
    };
  }, {});

const commitToChagelogLine = (commit: Commit, issuesUrl: string) => {
  const message = commit.parsed.subject.replace(
    /(.+)\(#([0-9]+)\)/,
    `$1([#$2](${issuesUrl}$2))`
  );

  return `* ${message}`;
};

const calculateBump = (
  indexedByType: IndexedByType,
  bumpLabels: GroupLabel[]
): string => {
  if (!bumpLabels.length) {
    return '';
  }
  for (let i = 0; i < bumpLabels.length; i++) {
    const { title, types } = bumpLabels[i];
    if (
      types.some((type) => indexedByType[type] && indexedByType[type].length)
    ) {
      return title;
    }
  }
  return bumpLabels[bumpLabels.length - 1].title;
};

type CommitSorter = (a: Commit, b: Commit) => -1 | 1;

export type CommitSortOrder = 'asc' | 'desc';

const commitSortBy: Record<CommitSortOrder, CommitSorter> = {
  asc: ({ date: dateA }, { date: dateB }) => (dateA < dateB ? -1 : 1),
  desc: ({ date: dateA }, { date: dateB }) => (dateA > dateB ? -1 : 1),
};

export type Changelog = {
  body: string;
  bump: string;
};

export type GroupLabel = {
  title: string;
  types: string[];
};

export type SortOrder = 'asc' | 'desc';

type GenerateChangelog = (params: {
  commits: Commit[];
  issuesUrl: string;
  typeLabels: GroupLabel[];
  bumpLabels: GroupLabel[];
  sortOrder?: SortOrder;
}) => Changelog;

export const generateChangelog: GenerateChangelog = ({
  commits,
  issuesUrl,
  typeLabels,
  bumpLabels,
  sortOrder = 'desc',
}) => {
  const indexedByType = indexByType(commits);
  const mapCommit = (commit: Commit) => commitToChagelogLine(commit, issuesUrl);
  const body = typeLabels
    .map(({ title, types }) => {
      const typeCommits = types
        .map((type) => indexedByType[type] || [])
        .flat()
        .sort(commitSortBy[sortOrder]);

      if (!typeCommits.length) {
        return null;
      }

      return [`## ${title}`, ...typeCommits.map(mapCommit)].join('\n');
    })
    .filter((block) => block !== null)
    .join('\n\n');
  const bump = calculateBump(indexedByType, bumpLabels);

  return {
    body,
    bump,
  };
};
