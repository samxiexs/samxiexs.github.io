# Shen (Sam) Xie — personal website

An English academic homepage with a Misc page for photography, music, and notes. Plain HTML, CSS, and a small amount of JavaScript; no dependencies or build step. Decorative graphics are generated in the browser with Canvas and SVG. Intended URL: https://samxiexs.github.io/.

## 本地预览

在本项目根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 http://127.0.0.1:8000 。主页直接打开 `index.html` 也可浏览。

## 结构与设计

布局参考 Kexin Huang 的主页：左侧固定 sidebar（名字、身份、导航、社交链接、亚特兰大当地时间、Appearance 设置），右侧为一整页内容；滚动时导航自动高亮当前章节（短横线变长的激活样式借自 Haotian Ye 的主页）。手机端 sidebar 折叠为顶部横向导航。

视觉上刻意保持"自己搭的学术主页"的样子：白底、近黑正文、Inter 字体、等宽小字做日期/状态等元数据，只有一种强调色。深色模式为深灰蓝底（`#161b26`），默认跟随访问者系统设置。强调色可在 Appearance 里选（深蓝 / 祖母绿 / 古铜金 / 覆盆子红 / 墨），浅色模式下都是能和正文区分开的中深色，深色模式下换成对应的明亮浅色；正文里的链接带一条淡下划线，两种模式都能一眼认出，颜色定义在 `style.css` 开头的 `data-accent` 规则和 `appearance.js` 的 `accents` 表中，两处需保持一致。

所有图形都用原生 Canvas / SVG 绘制，用正文色画成"论文插图"的样子，没有任何第三方库或构建步骤：

- **首页流场**（`field.js`）：单纯形噪声向量场上的粒子流线，鼠标经过会形成小漩涡，点击会让线条"扩散"成噪声再重新聚合（呼应 diffusion 研究）。开启系统"减少动态效果"时只渲染一帧静态流线。同一组件也用于摄影、音乐和 404 页面的标题区。
- **项目封面**（`site.js`）：按项目主题程序化生成——创作者匹配网络图、RQ-VAE 四个 codebook 的单元格网格（强调色标出被选中的码）、引用树；hover 时分别有数据流动、单元闪烁、树生长动画。每张图下有等宽字体的 fig. 说明。
- 头像 hover 时轻微 3D 倾斜；浅色/深色切换用 350ms 的颜色交叉淡入（`.theme-fade`），不截图、不重排，所以不会掉帧。
- 文案口吻偏轻松，带一些 :)，但每一句事实都来自 CV；改文案时保持这一点。关键词（学位、研究方向、奖项、方法名）用 `<strong>` 加粗，机构和老师用链接，写法参考 ruqisun.top。

## 更新内容

- `index.html`：个人介绍、研究项目、经历、教育、动态。研究内容直接存在 HTML 中，禁用 JavaScript 也能阅读。每条研究可用 `<details class="paper-details">` 附加展开的细节。
- `style.css`：全站颜色、字体、桌面及手机布局。颜色变量在文件开头，`--field-rgb` 供 Canvas 读取流场线条颜色。
- `site.js`：滚动高亮、头像倾斜、当地时间、项目封面生成。给项目卡片加 `data-cover="network|codebook|tree"` 即可获得对应封面。
- `field.js`：流场动画；`scale`、`speed`、`fillStyle` 的透明度控制线条的疏密和拖尾长度。
- `appearance.js`：Appearance 设置。可选择 System / Light / Dark、五种强调色、Default / Mono 字体，以及 90% 至 110% 的字体大小；选择会保存于访问者的浏览器，并在全部页面沿用。
- `pic/self.jpg`：个人照片；当前使用原图，由 CSS 控制展示区域。
- `pic/logos/`：Education / Experience 里的校徽（Georgia Tech、武汉大学、HEC Paris、HKUST），来自 Wikimedia / 英文维基百科的校徽文件，仅用于标示所属机构。换学校时放一张方形或圆形徽标即可，CSS 会缩到 40px 白底圆角框内。
- 老师姓名链接到各自主页（Xitong Li、Tat Koon Koh、Mingwei Sun），机构名链接到官网；新增合作者时照此在 `index.html` 里加 `<a>` 即可。
- `cv-refernce/ShenXie-CV-20260914.pdf`：网站链接的当前 CV。替换版本后同步修改各页面中的链接。
- `misc.html`：Photography / Music / Notes 三个板块在同一页，sidebar 里 Misc 下方会显示这三个子导航并随滚动高亮。照片点击后在页内灯箱中查看，支持左右方向键。
- `collections.js`：照片、音乐、笔记条目；数组留空时显示一句占位文字。
- `photography.html` / `music.html`：只剩跳转到 `misc.html` 对应板块的重定向，保留是为了旧链接不失效。
- 正文字体 Inter 通过 Google Fonts 加载，加载失败时回退到系统无衬线字体。

### 添加照片

把照片放在 `pic/photos/`，在 `collections.js` 的 `photos` 数组中加入：

```js
{ src: "pic/photos/atlanta.jpg", alt: "描述画面内容", caption: "Atlanta · 2026" }
```

页面自动出现双列照片集，手机为单列；点击照片进入灯箱。只使用自己的实际照片。

### 添加音乐

在 `music` 数组中加入分享链接：

```js
{ title: "歌单名称", artist: "作者", note: "分享理由", url: "https://你的音乐链接" }
```

或把可分享的音频放在 `assets/audio/`，使用 `src: "assets/audio/recording.mp3"` 代替 `url`。页面自动生成原生播放器，不会自动播放。

### 写笔记

两步：

1. 复制 `notes/_template.html` 为 `notes/<slug>.html`，改标题、日期、摘要，正文写在 `<article class="prose">` 里（段落、小标题、图片、引用、代码块都有样式）。
2. 在 `collections.js` 的 `notes` 数组加一条：

```js
{ title: "笔记标题", date: "2026-09-15", summary: "一句话摘要", href: "notes/<slug>.html" }
```

只想放一句话、不需要单独页面的，省略 `href` 即可。列表按数组顺序显示，新的写在前面。

## GitHub Pages

将网站文件提交并推送到当前仓库，在 GitHub 的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**，选择实际推送的分支（通常为 `main`）和 **/ (root)**，保存即可。`.nojekyll` 保证文件按静态资源发布。无需 npm、Jekyll、域名或服务器费用。

若 Pages 已使用 GitHub Actions，请切换为以上分支发布方式，或自行配置工作流；本项目没有构建工作流。新建自定义域名还需要 DNS 和 Pages 设置，不能仅添加 CNAME 文件。

## 内容依据和维护说明

依据两份 September 2026 CV，页面链接以 `20260914` 版为准。项目链接来自 PDF 中的真实超链接。广告推荐项目两份 CV 对合作者描述不同，因此网页省略这处归属描述。HCI 项目按 CV 说明隐藏题目和研究细节。所有在研论文都明确标注为在研/审稿中，未写成已录用，也未将拟投会议写成发表记录。具体状态请随研究进度更新。

摄影、音乐和笔记尚未提供素材，因此没有使用第三方照片或虚构作品。设计参考 Kexin Huang 网站中研究与个人兴趣并存的结构，以及用户提供的学术主页；代码独立编写。
