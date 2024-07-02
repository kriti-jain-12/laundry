
## Files
```bash
.eslintrc.js
.github
   |-- workflows
   |   |-- main.yml
.gitignore
.prettierrc
README.md
nest-cli.json
package.json
src
   |-- app.module.ts
   |-- config
   |   |-- configuration.ts
   |   |-- constants.ts
   |-- i18n
   |   |-- ar
   |   |   |-- messages.json
   |   |-- en
   |   |   |-- messages.json
   |   |-- es
   |   |   |-- messages.json
   |   |-- fr
   |   |   |-- messages.json
   |-- main.ts
   |-- models
   |   |-- app
   |   |   |-- app.contact.model.ts
   |   |   |-- app.content.model.ts
   |   |   |-- app.help.model.ts
   |   |-- docs
   |   |   |-- categories.model.ts
   |   |   |-- document.types.model.ts
   |   |   |-- documents.model.ts
   |   |-- users
   |   |   |-- countries.model.ts
   |   |   |-- users.feedback.model.ts
   |   |   |-- users.model.ts
   |   |   |-- users.verification.model.ts
   |-- modules
   |   |-- auth
   |   |   |-- auth.controller.ts
   |   |   |-- auth.module.ts
   |   |   |-- auth.service.ts
   |   |   |-- dto
   |   |   |   |-- auth.dto.ts
   |   |-- categories
   |   |   |-- categories.controller.ts
   |   |   |-- categories.module.ts
   |   |   |-- categories.service.ts
   |   |-- documents
   |   |   |-- documents.controller.ts
   |   |   |-- documents.module.ts
   |   |   |-- documents.service.ts
   |   |   |-- dto
   |   |   |   |-- documents.dto.ts
   |   |-- profile
   |   |   |-- dto
   |   |   |   |-- profile.dto.ts
   |   |   |-- profile.controller.ts
   |   |   |-- profile.module.ts
   |   |   |-- profile.service.ts
   |   |-- utils
   |   |   |-- dto
   |   |   |   |-- util.dto.ts
   |   |   |-- utils.controller.ts
   |   |   |-- utils.helper.service.ts
   |   |   |-- utils.localization.service.ts
   |   |   |-- utils.module.ts
   |   |   |-- utils.seeders.service.ts
   |   |   |-- utils.service.ts
   |   |   |-- utils.storage.service.ts
   |   |   |-- utils.timezone.service.ts
   |-- utils
   |   |-- bad.request.filter.ts
   |   |-- countries.json
   |   |-- enums.ts
   |   |-- joi.validation.pipe.ts
   |   |-- jwt.guard.ts
   |   |-- jwt.strategy.ts
   |   |-- request-logger.middleware.ts
   |   |-- response.ts
tsconfig.build.json
tsconfig.json
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```