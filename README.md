# Shen (Sam) Xie — personal website

An English academic homepage with separate spaces for photography and music. Plain HTML, CSS, and a small amount of JavaScript; no dependencies or build step. Intended URL: https://samxiexs.github.io/.

## 本地预览

在本项目根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 http://127.0.0.1:8000 。主页直接打开 `index.html` 也可浏览。

## 更新内容

- `index.html`：个人介绍、研究项目、经历、教育、动态。研究内容直接存在 HTML 中，禁用 JavaScript 也能阅读。
- `style.css`：全站颜色、字体、桌面及手机布局。使用 `prefers-color-scheme` 自动跟随系统浅色/深色设置，切换系统主题立即生效，无需刷新或手动开关。
- `pic/self.jpg`：个人照片；当前使用原图，由 CSS 控制展示区域。
- `cv-refernce/ShenXie-CV-20260914.pdf`：网站链接的当前 CV。替换版本后同步修改各页面中的链接。
- `collections.js`：照片和音乐条目；两个数组留空时显示待更新说明。
- `photography.html` / `music.html`：独立的个人兴趣页面。

### 添加照片

把照片放在 `pic/photos/`，在 `collections.js` 的 `photos` 数组中加入：

```js
{ src: "pic/photos/atlanta.jpg", alt: "描述画面内容", caption: "Atlanta · 2026" }
```

页面自动出现双列照片集，手机为单列；点击照片查看原图。只使用自己的实际照片。

### 添加音乐

在 `music` 数组中加入分享链接：

```js
{ title: "歌单名称", artist: "作者", note: "分享理由", url: "https://你的音乐链接" }
```

或把可分享的音频放在 `assets/audio/`，使用 `src: "assets/audio/recording.mp3"` 代替 `url`。页面自动生成原生播放器，不会自动播放。

## GitHub Pages

将网站文件提交并推送到当前仓库，在 GitHub 的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**，选择实际推送的分支（通常为 `main`）和 **/ (root)**，保存即可。`.nojekyll` 保证文件按静态资源发布。无需 npm、Jekyll、域名或服务器费用。

若 Pages 已使用 GitHub Actions，请切换为以上分支发布方式，或自行配置工作流；本项目没有构建工作流。新建自定义域名还需要 DNS 和 Pages 设置，不能仅添加 CNAME 文件。

## 内容依据和维护说明

依据两份 September 2026 CV，页面链接以 `20260914` 版为准。项目链接来自 PDF 中的真实超链接。广告推荐项目两份 CV 对合作者描述不同，因此网页省略这处归属描述。HCI 项目按 CV 说明隐藏题目和研究细节。所有在研论文都明确标注为在研/审稿中，未写成已录用，也未将拟投会议写成发表记录。具体状态请随研究进度更新。

摄影和音乐尚未提供素材，因此没有使用第三方照片或虚构作品。设计参考 Kexin Huang 网站中研究与个人兴趣并存的结构，以及用户提供的学术主页；代码独立编写。
