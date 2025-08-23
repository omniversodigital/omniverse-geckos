/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva característica
        'fix',      // Corrección de bug
        'docs',     // Documentación
        'style',    // Cambios de formato (sin cambios de código)
        'refactor', // Refactoring de código
        'test',     // Agregar/modificar tests
        'chore',    // Tareas de mantenimiento
        'ci',       // Cambios en CI/CD
        'perf',     // Mejoras de performance
        'build',    // Cambios en build system
        'revert',   // Revertir commit anterior
        'wip'       // Work in progress (usar con moderación)
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72],
    'footer-max-line-length': [2, 'always', 72]
  },
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  prompt: {
    questions: {
      type: {
        description: "Selecciona el tipo de cambio que estás enviando:",
        enum: {
          feat: {
            description: "Una nueva característica",
            title: "Features",
            emoji: "✨"
          },
          fix: {
            description: "Una corrección de bug",
            title: "Bug Fixes", 
            emoji: "🐛"
          },
          docs: {
            description: "Solo cambios de documentación",
            title: "Documentation",
            emoji: "📚"
          },
          style: {
            description: "Cambios que no afectan el significado del código",
            title: "Styles",
            emoji: "💎"
          },
          refactor: {
            description: "Un cambio de código que no corrige bug ni agrega feature",
            title: "Code Refactoring",
            emoji: "📦"
          },
          perf: {
            description: "Un cambio de código que mejora el performance",
            title: "Performance Improvements",
            emoji: "🚀"
          },
          test: {
            description: "Agregar tests faltantes o corregir tests existentes",
            title: "Tests",
            emoji: "🚨"
          },
          build: {
            description: "Cambios que afectan el build system o dependencias externas",
            title: "Builds",
            emoji: "🛠"
          },
          ci: {
            description: "Cambios a archivos de CI y scripts",
            title: "Continuous Integrations",
            emoji: "⚙️"
          },
          chore: {
            description: "Otros cambios que no modifican src o test files",
            title: "Chores",
            emoji: "♻️"
          },
          revert: {
            description: "Revierte un commit anterior",
            title: "Reverts",
            emoji: "🗑"
          }
        }
      },
      scope: {
        description: "¿Cuál es el alcance de este cambio (ej. component, page, api)?",
      },
      subject: {
        description: "Escribe una descripción corta e imperativa del cambio:",
      },
      body: {
        description: "Proporciona una descripción más larga del cambio:",
      },
      isBreaking: {
        description: "¿Hay algún cambio que rompe la compatibilidad?",
      },
      breakingBody: {
        description: "Un commit BREAKING CHANGE requiere un cuerpo. Por favor describe qué se rompió:",
      },
      breaking: {
        description: "Describe los cambios que rompen la compatibilidad:",
      },
      isIssueAffected: {
        description: "¿Este cambio afecta algún issue abierto?",
      },
      issuesBody: {
        description: "Si los issues están cerrados, el commit requiere un cuerpo. Por favor describe brevemente:",
      },
      issues: {
        description: "Lista los issues cerrados por este commit (ej. #31, #34):",
      }
    }
  }
};