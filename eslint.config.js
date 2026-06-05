import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'android/**/*', 'dev-dist/**/*', 'telegram-admin-bot/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
