/** @type {import('lint-staged').Config} */
module.exports = {
  // TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
    () => 'tsc --noEmit' // Type check all files, not just staged ones
  ],
  
  // JSON, Markdown, YAML files
  '*.{json,md,yml,yaml}': [
    'prettier --write'
  ],
  
  // CSS and SCSS files  
  '*.{css,scss,sass}': [
    'prettier --write'
  ],
  
  // Package.json files
  'package*.json': [
    'prettier --write',
    // Sort package.json if available
    () => {
      try {
        require('sort-package-json');
        return 'sort-package-json';
      } catch {
        return 'echo "sort-package-json not installed, skipping sort"';
      }
    }
  ],
  
  // Dockerfile
  'Dockerfile*': [
    () => {
      try {
        require('dockerfile_lint');
        return 'dockerfile_lint';
      } catch {
        return 'echo "dockerfile_lint not installed, skipping lint"';
      }
    }
  ],
  
  // SVG files optimization
  '*.svg': [
    () => {
      try {
        require('svgo');
        return 'svgo --multipass --pretty';
      } catch {
        return 'echo "svgo not installed, skipping optimization"';
      }
    }
  ],
  
  // Environment files validation
  '.env*': [
    (filenames) => {
      const envFiles = filenames.filter(f => f.startsWith('.env'));
      if (envFiles.length === 0) return [];
      
      return [
        // Check for accidentally committed secrets
        `echo "⚠️  Checking ${envFiles.join(', ')} for potential secrets..."`,
        ...envFiles.map(file => 
          `grep -H -n -E "(secret|key|token|password)" ${file} || echo "No obvious secrets found in ${file}"`
        )
      ];
    }
  ],
  
  // Smart contract files (Solidity)
  '*.sol': [
    () => {
      try {
        require('solhint');
        return 'solhint';
      } catch {
        return 'echo "solhint not installed, skipping Solidity lint"';
      }
    }
  ]
};