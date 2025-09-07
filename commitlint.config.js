module.exports = {
    rules: {
        'header-max-length': [2, 'always', 100],
        'subject-empty': [2, 'never'],
        'type-enum': [
            2,
            'always',
            [
                'feature',
                'fix',
                'chore',
                'docs',
                'refactor',
                'test'
            ]
        ],
        'header-match-team-pattern': [2, 'always']
    },
    plugins: [
        {
            rules: {
                'header-match-team-pattern': ({ header }) => {
                    const regex = /^[a-zA-Z0-9_-]+ - (feature|fix|chore|docs|refactor|test): .+$/;
                    const isValid = regex.test(header);

                    if (!isValid) {
                        return [false, `The commit message must follow the format: "username - type: description"\Example: "mario-rossi - feature: add login button"`];
                    }

                    const currentBranch = require('child_process')
                        .execSync('git rev-parse --abbrev-ref HEAD')
                        .toString()
                        .trim();

                    if (currentBranch === 'main') {
                        return [false, `You can't commit directly to main. Create a branch.`];
                    }

                    return [true];
                }
            }
        }
    ]
};