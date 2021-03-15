const core = require("@actions/core");
const conventionalChangelog = require('conventional-changelog');
const streamToPromise = require('stream-to-promise');

const generateChangelog = async (from, to) => {
    const buffer = await streamToPromise(conventionalChangelog({
        preset: 'conventionalcommits'
    }, {
        version: to,
        previousTag: from,
        currentTag: to,
    }, {
        from,
        to: 'HEAD',
    }, {}, {
        version: to,
        title: to
    }));
    return Buffer.from(buffer, 'utf8').toString();
};

(async () => {
    try {
        const from = core.getInput("from");
        const to = core.getInput("to");

        const changelog = await generateChangelog(from, to);
        core.setOutput("changelog", changelog)
    } catch (error) {
        core.setFailed(error.message)
    }
})();
