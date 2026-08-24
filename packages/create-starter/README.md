# @doyuli/create-starter

从 Starter 清单创建项目的命令行工具。清单维护在 [doyuli-starters/assets](https://github.com/doyuli-starters/assets) 仓库的 `starters.json`，提交即可更新，无需发布新包；拉取失败时回退到内置清单。

## Usage

```bash
pnpm create @doyuli/starter

# or

npx @doyuli/create-starter
```

带项目名：

```bash
npx @doyuli/create-starter my-app
```

自定义清单地址（默认 `doyuli-starters/assets` 仓库）：

```bash
DOYULI_STARTERS_URL=https://raw.githubusercontent.com/you/templates/main/starters.json npx @doyuli/create-starter
```

## 占位符约定

Starter 仓库中的文件内容可使用以下占位符，创建时自动替换：

| 占位符            | 替换为   |
| ----------------- | -------- |
| `pkg-placeholder` | 项目名   |
| `_description_`   | 项目描述 |
