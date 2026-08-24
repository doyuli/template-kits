# create-starter

create-starter - 快速生成你的模板代码

---

## 🚀 快速开始

### 创建 vue3 项目

```bash
npm create @doyuli/vue
```

### 创建 TypeScript Library 项目

```bash
npm create @doyuli/lib
```

### 创建 Starter 项目

```bash
npm create @doyuli/starter
```

## ⚙️ 命令行参数

三个 CLI 通用参数：

| 参数            | 作用                                       |
| --------------- | ------------------------------------------ |
| `[项目目录]`    | 传入后跳过「项目名称」提问                 |
| `--force`       | 目标目录已存在时跳过确认，直接覆盖         |
| `--default`     | 全部选项使用默认值（最小配置），全程无交互 |
| `-h, --help`    | 显示帮助                                   |
| `-v, --version` | 显示版本                                   |

各 CLI 的单项覆盖（提供后跳过对应提问）：

| CLI               | 参数                                   | 作用                                       |
| ----------------- | -------------------------------------- | ------------------------------------------ |
| `@doyuli/vue`     | `--features file-routing,vitest`       | 要包含的功能，逗号分隔                     |
| `@doyuli/vue`     | `--css unocss\|tailwindcss`            | 选择 CSS 框架                              |
| `@doyuli/lib`     | `--features monorepo,github-workflows` | 要包含的功能，逗号分隔                     |
| `@doyuli/starter` | `--starter "Nuxt Starter"`             | 按名称精确选择 Starter，未匹配则回退到选择 |
| `@doyuli/starter` | `--description "xxx"`                  | 项目描述                                   |

零交互示例：

```bash
# 一步生成最小配置的 Vue 项目
npm create @doyuli/vue my-app --default

# 指定功能与 CSS 框架
npm create @doyuli/vue my-app --features file-routing,vitest --css tailwindcss

# 非空目录一键覆盖
npm create @doyuli/vue my-app --default --force
```
