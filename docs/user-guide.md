# JOMOO Japan — System Guide (Phase 1)
# JOMOO 日本 — 系统说明书（第一阶段）

**Status / 状态:** Phase 1, delivered. Live at `https://jomoo-ashy.vercel.app` pending the cutover to the client's own domain.
第一阶段已交付。当前运行于 `https://jomoo-ashy.vercel.app`，等待切换至客户自有域名。

**Last updated / 更新日期:** 19 August 2026

**Site language / 网站语言:** Japanese only. There is no language switcher and no locale routing — all customer-facing text lives in one translation file.
网站仅提供日语。没有语言切换功能，也没有多语言路由；所有面向客户的文字均集中于一个翻译文件中。

---

## ⚠️ Instructions for the agent producing the final documents
## ⚠️ 给制作最终文档的助手的说明

*This section is working instruction, not client content. Delete it from anything delivered.*
*本节为工作说明，并非交付内容，请从最终交付文件中删除。*

### Split into three documents, not one / 建议拆分为三份文档

The material below serves three audiences who need almost nothing from each other. A single document forces customer-service staff to scroll past database schemas.
以下内容面向三类读者，彼此需要的信息几乎没有重叠。若合并为一份文档，客服人员将不得不翻阅数据库结构才能找到所需内容。

| # | Document / 文档 | Audience / 读者 | Sections / 对应章节 | Format / 形式 |
|---|---|---|---|---|
| 1 | **Member Guide / 会员使用指南** | Japanese end customers; front-line customer service / 日本终端客户；一线客服 | Part A | Short doc or slides, heavy on screenshots. ~8–10 pages. / 简短文档或幻灯片，配大量截图，约 8–10 页。 |
| 2 | **Staff Operations Manual / 运营人员操作手册** | JOMOO staff running the admin portal and the product catalogue / 负责后台管理与产品内容的 JOMOO 员工 | Parts B and C | Document. The main deliverable — task-based, step by step. / 文档形式。主要交付物，按任务分步骤编写。 |
| 3 | **Technical Handover / 技术交接文档** | JOMOO's development team, if they take the system over / 如由 JOMOO 技术团队接手，则为其开发人员 | Part D + Appendices | Document, written for developers. / 文档形式，面向开发人员。 |

Optionally a fourth: a **10–15 slide delivery deck** for the handover meeting, drawn from the System Overview and the summary tables. Do not make the deck the only deliverable — it cannot carry step-by-step instructions.
可另做第四份：**10–15 页交付演示文稿**，用于交接会议，内容取自「系统概览」与各汇总表。演示文稿不应作为唯一交付物，因其无法承载分步操作说明。

### Language / 语言

The operations manual is for **Chinese staff**, not Japanese staff. Suggested defaults, to confirm with the client:
运营手册的读者为**中国员工**，而非日本员工。建议如下，请与客户确认：

- **Member Guide → Japanese.** The readers are Japanese customers. / **会员指南 → 日语。** 读者为日本终端客户。
- **Staff Operations Manual → Simplified Chinese**, with the Japanese screen labels kept alongside each instruction, because the interface the reader is looking at is in Japanese. / **运营手册 → 简体中文**，但每条操作说明需保留界面上的日语原文标签，因为操作者看到的界面是日语。
- **Technical Handover → Simplified Chinese or English.** All code, comments and variable names are English. / **技术交接 → 简体中文或英文。** 代码、注释与变量名均为英文。

### How to write it / 撰写要求

- **Task-based, not feature-based.** Head sections with what the reader wants to do ("Import serial numbers from the factory"), not with the name of the screen. / **按任务而非按功能编排。** 章节标题应写读者要做的事（如「导入工厂提供的产品编号」），而非界面名称。
- **Screenshots are essential** for documents 1 and 2 and are not yet taken. Every screen named below needs one. Someone with an admin login must capture them, ideally with realistic data. / **第 1、2 份文档必须配截图**，目前尚未拍摄。下文提及的每个界面都需要截图，须由拥有后台账号的人员使用接近真实的数据拍摄。
- **Do not invent behaviour.** Where this guide says something is not yet built or not switched on, say so plainly. A manual that overstates the system creates support calls. / **不得臆造功能。** 凡本文标注为「尚未实现」或「尚未启用」的，请如实说明。夸大系统能力只会带来更多客服工单。
- **Keep the "Not in Phase 1" section.** Chinese delivery practice expects scope to be stated explicitly; it protects both sides. / **保留「第一阶段未包含」一节。** 中国的交付惯例要求明确界定范围，这对双方都是保护。

---

## System overview / 系统概览

Four surfaces, one system: / 四个入口，同一套系统：

| Surface / 入口 | Address / 地址 | Who uses it / 使用者 | Sign-in / 登录方式 |
|---|---|---|---|
| **Public website / 公开网站** | `/` | Anyone / 任何人 | None / 无需登录 |
| **Member portal / 会员中心** | `/dashboard` | Registered customers / 已注册客户 | Email + password / 邮箱 + 密码 |
| **Admin portal / 管理后台** | `/admin` | JOMOO staff / JOMOO 员工 | Separate username + password / 独立的用户名 + 密码 |
| **Content studio (Sanity) / 内容管理后台** | `/studio` | Whoever maintains product pages / 产品页面维护人员 | Sanity account / Sanity 账号 |

The admin portal is deliberately **not linked from anywhere on the public site**. Staff reach it by typing the address.
管理后台**在公开网站上没有任何入口链接**，员工需直接输入网址访问。

What the system does: / 系统功能概要：

- Presents the product catalogue — four series, with specifications, images and 3D/video. / 展示产品目录：四大系列，含规格参数、图片及 3D／视频。
- Takes enquiries through a contact form and routes each to the right department. / 通过咨询表单接收客户咨询，并按类别转交对应部门。
- Registers customers as JOMOO Club members. / 客户注册成为 JOMOO 俱乐部会员。
- Lets members register a product they have bought, against its serial number. / 会员可凭产品编号登记已购买的产品。
- Issues an electronic warranty card automatically when the serial number checks out. / 产品编号校验通过后，自动签发电子保修卡。
- Gives staff an admin portal for all of the above, plus a serial number library with a full audit trail. / 为员工提供管理后台，并配备带完整操作日志的产品编号库。

---

# Part A — Guide for customers / 第一部分 — 客户使用指南

## A1. Browsing products / 浏览产品

No account needed. / 无需登录。

- Four series: **スマートトイレ** (smart toilets), **洗面台** (washstands), **水栓** (faucets), **シャワー** (shower sets). / 四大系列：智能马桶、洗面台、水龙头、淋浴花洒。
- Each product page carries the hero image, feature cards, a full specification table, and where available a video or interactive 3D view. / 每个产品页面包含主视觉图、功能卡片、完整规格表，部分产品另有视频或可交互 3D 展示。
- All of this is edited in the Sanity studio (Part C) — it is not hard-coded. / 以上内容均在 Sanity 后台维护（见第三部分），并非写死在代码中。

## A2. Making an enquiry / 提交咨询

**Where / 位置:** お問い合わせ (`/contact-us`)

1. Choose the enquiry type — this decides which department receives it. / 选择咨询类别，该选择决定由哪个部门接收。
2. Fill in name, company (optional), email, phone (optional). / 填写姓名、公司名称（选填）、邮箱、电话（选填）。
3. Write the enquiry. / 填写咨询内容。
4. Optionally tick ショールーム予約 to request a showroom visit, then give a preferred date and time. / 如需预约展厅，勾选「ショールーム予約」并填写期望日期与时间。
5. Submit. / 提交。

**What happens next / 提交之后:** the enquiry is emailed to the department that owns that category, and an automatic acknowledgement goes to the customer. Every enquiry is also **stored in the system**, so nothing is lost if an email fails.
咨询内容将通过邮件发送至对应部门，同时向客户发送自动回执。所有咨询同时**存入系统数据库**，即使邮件发送失败也不会丢失。

| Category / 类别 | Routed to / 转交部门 |
|---|---|
| 業務提携・アライアンスについて | Partnerships / 业务合作 |
| 製品・サービスに関するお問い合わせ | Product & service / 产品与服务 |
| 資料請求・お見積り | Materials & quotations / 资料索取与报价 |
| ご利用中のお客様サポート | Customer support / 客户支持 |
| 不具合・障害報告 | Faults / 故障报修 |
| 採用に関するお問い合わせ | Recruitment / 招聘 |

The destination address for each is configurable without changing the site (Part D). / 各类别的收件地址可通过配置修改，无需改动网站代码（见第四部分）。

## A3. Creating an account / 注册会员（会員登録）

**Where / 位置:** 新規会員登録 (`/sign-up`)

Three steps, shown by a progress indicator across the top. / 共三步，页面顶部有步骤指示器。

**Step 1 — 会員種別選択 / 第一步：选择会员类别.** 法人のお客様 (corporate / 企业客户) or 個人のお客様 (individual / 个人客户). This changes which fields appear next. / 该选择决定下一步显示哪些字段。

**Step 2 — 会員情報登録 / 第二步：填写会员信息.** Email, name and furigana, phone, address, password. / 邮箱、姓名及假名、电话、地址、密码。
- Corporate members also give a company name and its furigana. / 企业客户另需填写公司名称及其假名。
- Individual members are additionally asked for gender and date of birth (both optional). / 个人客户可另填性别与出生日期（均为选填）。
- Password: at least 8 characters, mixing upper case, lower case, and numbers or symbols. / 密码须至少 8 位，且包含大写字母、小写字母以及数字或符号。

**Step 3 — 登録完了 / 第三步：注册完成.** The account is created when 次へ is pressed on step 2 — there is no separate confirmation screen to press again. The member is signed in immediately.
在第二步点击「次へ」时账号即创建完成，没有额外的确认页面。会员随即自动登录。

> **Note for staff / 员工须知:** email address confirmation is built but **switched off** for Phase 1, at the client's request, so a member is never blocked while waiting for an email. While it is off, a mistyped email address still creates a usable account — but that member will never receive their warranty card, so check addresses when supporting a customer.
> 邮箱验证功能已开发，但应客户要求在第一阶段**未启用**，以免会员因等待邮件而无法使用。在未启用期间，即使邮箱填错也能成功注册，但该会员将永远收不到保修卡，因此在客服过程中请注意核对邮箱地址。

## A4. Signing in and out / 登录与退出

**Where / 位置:** ログイン (`/sign-in`)

Email address and password. On success the member lands on `/dashboard`. / 输入邮箱与密码，成功后进入会员中心。

- **Forgotten password / 忘记密码:** a reset link is emailed, valid for one hour. / 系统发送重置链接邮件，有效期一小时。
- **Signing out / 退出登录:** from the member page. / 在会员中心页面操作。
- **Two-factor authentication (TOTP) / 双重验证:** built and working, but **switched off** for Phase 1. When enabled, sign-in gains a second screen asking for a six-digit code. / 已开发并可用，但第一阶段**未启用**。启用后登录将增加一步，要求输入六位验证码。

## A5. Registering a product / 登记产品（製品登録）

**Where / 位置:** 製品を登録 (`/register`) — sign-in required / 需先登录。

**Step 1 — basic information / 第一步：基本信息.** Product model, installation date, installation address, contact name, and optionally purchase date and dealer name. / 产品型号、安装日期、安装地址、联系人姓名，以及选填的购买日期与经销商名称。

**Step 2 — serial number / 第二步：产品编号（製造番号）.** Type the number from the product label and press 製造番号を照合する to check it. / 输入产品标签上的编号，点击「製造番号を照合する」进行校验。
- A serial is the letter **J** followed by digits — 19 for most products, 20 for shower sets. / 编号为字母 **J** 加数字：多数产品 19 位，淋浴花洒 20 位。
- The field cleans input as it is typed: spaces and dashes are removed, full-width digits are converted, and characters that could never be part of a serial cannot be entered. / 输入时自动处理：去除空格与连字符，全角数字自动转半角，不可能出现在编号中的字符无法输入。
- **A serial number can only be registered once, by anyone.** / **每个产品编号全系统仅可登记一次。**
- **A serial that staff have marked 取消済み (Revoked) or 要確認 (Abnormal) is refused.** The customer is told to contact the service line — this is not something they can fix by retyping. / **被员工标记为「取消済み」或「要確認」的编号将被拒绝登记**，并提示客户联系服务热线；重新输入无法解决。

**Step 3 — photographs / 第三步：上传照片.** A photo of the warranty document and a photo of the serial number plate. Up to 10 MB each; JPEG, PNG or HEIC. / 上传保修单照片与产品编号铭牌照片，单张不超过 10 MB，支持 JPEG、PNG、HEIC。

**On submit / 提交结果:**

| If the serial number… / 编号校验结果 | Status / 状态 | Result / 处理 |
|---|---|---|
| passes / 通过 | 登録済み（保証付き） | **Electronic warranty card issued immediately**, and emailed / **立即签发电子保修卡**并发送邮件 |
| does not pass / 未通过 | 審査中 | Held for staff review, flagged in the admin portal, acknowledgement emailed / 转入人工审核，在后台标记，并发送受理邮件 |
| revoked or abnormal / 已取消或异常 | — | **Registration refused** / **拒绝登记** |

### A5b. Photo-first registration / 拍照登记（可选）

**Where / 位置:** `/register?auto=true`

An alternative step 2 aimed at phones: photograph the serial plate first and the system reads the number off the image, so the member only has to check it rather than type twenty digits. The number stays editable, alternative readings are offered, and the same check decides the outcome — the photograph never grants a warranty on its own.
面向手机用户的第二步替代方案：先拍摄编号铭牌，系统自动识别编号，会员只需核对而无需手动输入二十位数字。编号仍可编辑，系统会提供其他识别候选；最终仍由同一套校验决定结果，照片本身不会直接产生保修资格。

> **Not active yet / 尚未启用.** Requires a paid text-recognition add-on that is not currently subscribed. Until then the screen falls back to typing. The normal `/register` flow is unaffected.
> 该功能依赖一项付费文字识别服务，目前尚未订阅。在订阅之前，该页面将回退为手动输入。常规 `/register` 流程不受影响。

## A6. The electronic warranty card / 电子保修卡（電子保証カード）

**Where / 位置:** `/warranty/<registration id>` — reached from the member page / 从会员中心进入。

Shows the product, serial number, customer, installation address and expiry date, formatted to be printed or saved as PDF. Below it sit the full 無料修理規定 (warranty terms) and the JOMOO Club section. **Only the card itself prints** — the terms and club sections are hidden from the printout.
显示产品、编号、客户、安装地址与到期日，版面适合打印或另存为 PDF。下方为完整的「無料修理規定」保修条款与 JOMOO 俱乐部说明。**打印时仅输出保修卡本身**，条款与俱乐部部分不会打印。

**Warranty length / 保修期限:** three years from the installation date. / 自安装日起三年。

## A7. The member page / 会员中心（マイページ）

**Where / 位置:** `/dashboard`

**ご登録製品 / 已登记产品** — every product registered, with model, installation date, serial number, status and photographs. From here the member can view the warranty card, or edit or delete a registration while it is still 審査中 or 要修正. Below sits the 保証延長 panel and a button to register another product.
列出全部已登记产品，含型号、安装日期、编号、状态与照片。会员可在此查看保修卡；当状态为「審査中」或「要修正」时，还可修改或删除该登记。下方为「保証延長」说明与再次登记产品的按钮。

**ご契約情報 / 保修信息** — the warranties currently held, with model, serial number and expiry date, and a link to each card. / 列出当前持有的保修，含型号、编号、到期日及保修卡链接。

**お客様情報 / 客户信息** — the member's own details. 編集する opens the full 登録情報変更 form (`/account`) to change details or password. The email address is read-only, because it is the sign-in identity.
显示会员本人信息。点击「編集する」进入「登録情報変更」页面，可修改资料或密码。邮箱为只读，因为它是登录账号。

---

# Part B — Guide for staff / 第二部分 — 员工操作指南（管理后台）

## B1. Signing in, and what you are allowed to do / 登录与权限

**Where / 位置:** `/admin` — not linked from the public site / 公开网站上无入口链接。

Username and password, separate from customer accounts. The signed-in user and their role appear at the bottom of the sidebar (or in the top bar on a phone).
使用独立于客户账号的用户名与密码。当前登录者及其角色显示在侧边栏底部（手机上显示于顶栏）。

### Roles / 角色权限

Three roles, controlling the two actions that cannot be undone from inside the portal.
共三种角色，用于控制后台内无法撤销的两类操作。

| Role / 角色 | View & edit / 查看与编辑 | Download CSV / 导出 CSV | Delete / 删除 |
|---|---|---|---|
| **Operator / 操作员** | ✅ | ❌ | ❌ |
| **Manager / 主管** | ✅ | ✅ | ❌ |
| **Owner / 管理员** | ✅ | ✅ | ✅ |

Buttons the role cannot use are hidden or disabled, **and** the action is refused by the server — the restriction cannot be worked around. If a button seems to be missing, check the role in the sidebar before reporting a fault.
无权限的按钮会被隐藏或禁用，**同时**服务端也会拒绝该操作，因此无法绕过限制。若发现按钮缺失，请先查看侧边栏中的角色，再判断是否为故障。

The portal works on a phone or tablet: the sidebar becomes a scrolling top bar, and wide tables scroll sideways within their panel.
后台支持手机与平板：侧边栏变为可横向滚动的顶栏，宽表格在其面板内横向滚动。

## B2. Dashboard / 仪表盘

Member count, warranties issued, registrations without a warranty, and the most recent registrations.
会员总数、已签发保修数、无保修的登记数，以及最近的登记记录。

## B3. Users / 会员管理

- Search members by name or email. / 按姓名或邮箱搜索会员。
- Open a member to see their details and every product they have registered. / 打开会员可查看其资料与全部已登记产品。
- Edit name, email, gender or date of birth. / 可修改姓名、邮箱、性别与出生日期。
- **Delete a member** (Owner only). This also removes their registrations and warranties, and any serial numbers they had registered are released back to **Unused**, so the product can be registered again by its next owner. / **删除会员**（仅管理员）。同时删除其登记记录与保修；其登记过的产品编号将释放回「未使用」状态，以便下一位持有人重新登记。
- **Download CSV** (Manager and above). / **导出 CSV**（主管及以上）。

## B4. Registrations / 产品登记

Every registration, filterable by With Warranty / No Warranty. Open one to see the full submission including the uploaded photographs.
全部登记记录，可按「有保修／无保修」筛选。打开可查看完整提交内容，包括上传的照片。

Registrations that failed the serial check are flagged for review — these are the ones needing a decision.
编号校验未通过的登记会被标记为待审核，需要人工判断。

## B5. Serial numbers / 产品编号库（製造番号ライブラリ）

The factory's list of issued serial numbers. Four tabs. / 工厂已发出的产品编号清单，共四个标签页。

### Library / 编号库

Search by number, model, batch or note. Filter by status; each filter shows its count.
可按编号、型号、批次或备注搜索，并按状态筛选，每个筛选项显示数量。

| Status / 状态 | Meaning / 含义 |
|---|---|
| **Unused / 未使用** | Issued by the factory, not yet registered / 工厂已发出，尚未被登记 |
| **Bound / 已绑定** | Registered to a member / 已被某会员登记 |
| **Revoked / 已取消** | Withdrawn — scrapped, recalled, or issued in error / 已作废：报废、召回或误发 |
| **Abnormal / 异常** | Flagged for investigation — duplicate, suspected forgery, bad batch / 待调查：重复、疑似伪造或问题批次 |

> **Revoked and Abnormal serials are refused at registration.** A customer entering one is told to contact the service line. Marking a serial is therefore an operational decision with immediate effect — use Abnormal when a number needs investigating, and Revoked when it must never be used again.
> **标记为「已取消」或「异常」的编号将被拒绝登记。** 客户输入此类编号时会被提示联系服务热线。因此标记操作会立即生效，请谨慎使用：需要调查时用「异常」，确定永久作废时用「已取消」。

**Importing from the factory / 导入工厂清单.** Press **Import**; the file window opens straight away and the file is imported as soon as it is chosen.
点击 **Import**，系统立即打开文件选择窗口，选定文件后随即导入。
- Accepts a plain list, one serial per line, **or** a CSV. If the first row names its columns (`serial_number`, `series`, `model_name`, `status`, `note`) those are used; otherwise the first column is taken as the serial. / 支持每行一个编号的纯文本清单，**或** CSV 文件。若首行为列名（`serial_number`、`series`、`model_name`、`status`、`note`）则按列名解析，否则将第一列视为编号。
- The batch label is taken from the file name — so name the file after the delivery note. / 批次名称取自文件名，建议以送货单号命名文件。
- **Re-importing the same file is safe.** Serials already present are reported as skipped and never overwritten, so a registration already attached to one cannot be lost. / **重复导入同一文件是安全的。** 已存在的编号会被计为「跳过」且不会被覆盖，已绑定的登记不会丢失。
- A summary reports how many were added, how many were already there, and lists rejected rows with line numbers and reasons. / 导入后显示汇总：新增数量、已存在数量，以及被拒绝的行号与原因。

**Adding one by hand / 手动添加.** **+ Add serial**, for numbers that arrive by phone rather than by file. / 用于通过电话等方式获得的零散编号。

**Working on many at once / 批量操作.** Tick the rows, then set a status for all of them, or delete them (Owner only). Up to 500 at a time. / 勾选多行后可统一修改状态或删除（仅管理员），单次最多 500 条。

**Editing one / 编辑单条.** Open a serial to change its series, model, batch, note or status. Moving a serial off **Bound** also releases it from its registration, so it can be registered again — the registration itself is not touched. / 打开编号可修改系列、型号、批次、备注与状态。将状态从「已绑定」改为其他时，会同时解除与登记的绑定，使该编号可被重新登记；登记记录本身不受影响。

### Usage details / 使用明细

Only the serials that have actually been registered, joined to the member, the registration, the installation date and the warranty expiry. **This is the screen to use when a customer telephones about a specific product.**
仅列出已被登记的编号，并关联会员、登记记录、安装日期与保修到期日。**客户来电咨询具体产品时，请使用此页面。**

### Audit log / 操作日志

Who did what, and when. Every import, addition, edit, status change, deletion, binding and export, with the operator, timestamp and what changed. Filterable by action and operator, searchable, downloadable as CSV.
记录何人于何时做了什么：导入、新增、编辑、状态变更、删除、绑定与导出，均含操作者、时间与变更内容。可按操作类型与操作者筛选、搜索，并导出 CSV。

**The log is read-only by design** — there is no way to edit or delete an entry from the portal. A record that staff can tidy up is not evidence. Deletion entries deliberately survive the serial they describe, so "who deleted it" always has an answer.
**操作日志为只读设计**，后台无法编辑或删除条目。可被随意修改的记录不具备凭证价值。删除操作的日志会在对应编号被删除后继续保留，以确保「是谁删除的」始终可查。

> **Important / 重要:** until serial numbers are imported, the system accepts any correctly-formatted number. Importing the factory's list is what turns the check into a real one.
> 在导入产品编号之前，系统会接受任何格式正确的编号。只有导入工厂清单后，校验才成为真正的校验。

## B6. Warranties / 保修管理

Every warranty issued, with member, product, serial number and expiry date. / 已签发的全部保修，含会员、产品、编号与到期日。

## B7. Enquiries / 咨询管理

Every contact form submission, with category, sender, message and whether the notification email was delivered. Downloadable as CSV (Manager and above).
全部咨询表单提交记录，含类别、发送人、内容与通知邮件是否送达。可导出 CSV（主管及以上）。

Because enquiries are stored as well as emailed, a failed email does not lose the enquiry — the row shows as not delivered, and staff can follow up.
由于咨询同时入库与发信，邮件失败不会导致咨询丢失：该行会显示为未送达，员工可据此跟进。

## B8. Emails / 自动发送邮件

**For each email you can / 每封邮件均可:**
- **Switch it on or off.** Off means customers stop receiving it. / **开启或关闭。** 关闭后客户将不再收到该邮件。
- **Copy operational staff.** Add addresses to be copied on every send. / **抄送内部人员。** 可添加抄送地址。
- **Edit the wording** — press **Edit template**. / **修改文案** — 点击 **Edit template**。

**The template editor / 模板编辑器** shows the editor on the left and a **live preview on the right**, updating as you type, so wording is never saved unseen. The right pane switches between the rendered email and its HTML source.
左侧为编辑区，**右侧为实时预览**，随输入即时更新，确保文案不会在未查看的情况下保存。右侧可在「渲染效果」与「HTML 源码」之间切换。

- **Subject**, **greeting** and **body** are editable. One paragraph per line. / **主题**、**称呼**与**正文**均可编辑，正文每行为一段。
- **Tags** such as `{{name}}` or `{{modelName}}` are replaced with real values when sent. Available tags are listed below the body — click to copy. A tag that does not exist is rejected on save, so a typo cannot silently delete a sentence. / **变量标签**（如 `{{name}}`、`{{modelName}}`）在发送时替换为实际值。可用标签列于正文下方，点击即可复制。保存时会校验标签是否存在，拼写错误不会导致整句内容被悄悄清空。
- The header, footer and layout are fixed, so a mistake in the wording cannot break the rest of the email. / 页眉、页脚与版式固定，文案错误不会破坏邮件其余部分。
- **Reset to default** restores the wording the site was delivered with. / **Reset to default** 可恢复交付时的原始文案。

Some notifications cover more than one email — 製品登録 covers the acknowledgement, the correction request, and both review outcomes. These appear as tabs inside the editor.
部分通知包含多封邮件：「製品登録」涵盖受理通知、修改请求以及两种审核结果，编辑器内以标签页形式呈现。

Every email carries the JOMOO wordmark and the copyright line in its footer. The year updates itself.
所有邮件页脚均含 JOMOO 标识与版权信息，年份自动更新。

| Email / 邮件 | When / 触发时机 | Switchable / 可开关 |
|---|---|---|
| 会員登録完了メール | An account is created / 注册成功 | ✅ |
| パスワード再設定メール | A password reset is requested / 申请重置密码 | ✅ |
| 製品登録受付メール | A registration needs review / 登记需人工审核 | ✅ |
| 電子保証カード発行メール | A warranty is issued / 签发保修卡 | ✅ |
| お問い合わせ自動返信 | Contact form — to the customer / 咨询表单，发给客户 | ✅ |
| お問い合わせ通知（担当部署） | Contact form — internal copy / 咨询表单，发给部门 | ✅ |
| メールアドレス確認メール | Sign-up, while verification is on / 注册时（启用验证后） | Always sent / 始终发送 |

---

# Part C — Product content (Sanity CMS) / 第三部分 — 产品内容管理

## C1. What lives where / 内容分工

- **Sanity** holds everything about a *product*: names, model codes, images, feature cards, specification tables, videos, 3D models. / **Sanity** 存放*产品*相关的一切：名称、型号、图片、功能卡片、规格表、视频与 3D 模型。
- **The system's own database** holds everything about *people*: members, registrations, warranties, serial numbers, enquiries. / **系统数据库**存放*人*相关的一切：会员、登记、保修、产品编号与咨询。

Editing a product page never touches customer data, and vice versa. / 修改产品页面不会影响客户数据，反之亦然。

## C2. Signing in / 登录

**Where / 位置:** `/studio` — sign in with a Sanity account. Access is managed at [sanity.io](https://sanity.io) by whoever administers the project; adding a colleague is done there, not in the site.
使用 Sanity 账号登录。权限在 [sanity.io](https://sanity.io) 由项目管理员分配，新增人员需在该平台操作，而非在网站内。

## C3. What can be edited / 可编辑内容

**Product series / 产品系列** — the four category pages. / 四个分类页面。

**Product / 产品** — organised in tabs: / 按标签页组织：

| Tab / 标签页 | Contains / 内容 |
|---|---|
| Identity | Model code, series, name, URL slug, tagline / 型号、系列、名称、网址标识、宣传语 |
| Hero | Eyebrow, title, catchphrase, main image / 引导文字、标题、主标语、主图 |
| Content | Feature cards, standard feature groups, long description / 功能卡片、标准功能分组、详细介绍 |
| Specs | Specification image, specification tables by section / 规格图、分组规格表 |
| Media | Video, 3D model, gallery / 视频、3D 模型、图库 |
| Settings | Publishing options / 发布设置 |

**Changes appear on the website after publishing.** Draft edits are visible only inside the studio.
**内容需发布后才会显示在网站上**，草稿仅在后台可见。

> **Take care with the URL slug / 请谨慎修改网址标识.** It forms the product's web address. Changing it on a published product breaks any existing links to that page.
> 该字段构成产品页面网址。修改已发布产品的该字段会导致原有链接失效。

---

# Part D — Technical handover / 第四部分 — 技术交接

For a development team taking the system over. / 供接手系统的开发团队参考。

## D1. Stack / 技术栈

| Layer / 层 | Technology / 技术 |
|---|---|
| Framework | **Next.js 16.2.6**, App Router, React 19, TypeScript |
| Database | **PostgreSQL**, hosted on Railway / 部署于 Railway |
| Database access | **Drizzle ORM** — schema in `src/lib/db/schema.ts` |
| Auth (members) | **Better Auth** — email/password, optional TOTP |
| Auth (admin) | Custom — signed JWT in an httpOnly cookie, `src/lib/admin-auth.ts` |
| Content | **Sanity** — studio embedded at `/studio` |
| Images | **Cloudinary** — signed direct-from-browser uploads / 浏览器直传，服务端签名 |
| Email | **Resend** |
| Hosting | **Vercel** — connected to the Git repository / 已连接 Git 仓库 |
| i18n | **next-intl**, single Japanese catalogue / 单一日语词条文件 |
| Testing | **Playwright** |

Styling is a mix of Tailwind CSS v4 utility classes and hand-written stylesheets beside the components that use them (`member-portal.css`, `jomoo-homepage.css`, `warranty-document.css`, `admin-chrome.css`).
样式为 Tailwind CSS v4 工具类与手写样式表混用，样式表与使用它的组件放在一起。

## D2. Repository layout / 目录结构

```
src/
  app/
    (site)/            public site, member portal, auth pages
    admin/             admin portal (login + protected group)
    api/               route handlers
    studio/            embedded Sanity studio
  components/          home, product, dashboard, registration,
                       admin, auth, warranty, ui
  lib/                 db, auth, admin-auth, serial*, email*, resend,
                       cloudinary, sanity, notifications, csv, appUrl, warranty
  messages/ja.json     every piece of Japanese UI text
  sanity/schemaTypes/  product and productSeries schemas
docs/                  this guide
```

## D3. Database / 数据库

Thirteen tables. Better Auth owns `user`, `session`, `account`, `verification`, `two_factor`. The application owns:
共十三张表。Better Auth 拥有 `user`、`session`、`account`、`verification`、`two_factor`，其余由应用拥有：

| Table / 表 | Holds / 内容 |
|---|---|
| `product_registrations` | Every registration, its status and photographs / 登记记录、状态与照片 |
| `warranty_records` | One per registration that earned a warranty / 每条获得保修的登记对应一行 |
| `ownership_transfers` | History of changes to a registration's owner details / 登记所有者信息的变更历史 |
| `contact_submissions` | Every contact form enquiry / 全部咨询表单记录 |
| `notification_settings` | Which automatic emails are on, and CC addresses / 自动邮件开关与抄送地址 |
| `email_templates` | Admin-edited wording — an absent row means "use the shipped default" / 后台编辑的邮件文案；无记录即表示使用出厂默认文案 |
| `serial_numbers` | The serial number library / 产品编号库 |
| `serial_audit_logs` | The audit trail — deliberately not foreign-keyed, so entries survive deletion / 操作日志，刻意不设外键，以便记录在对象删除后仍然保留 |

**Applying schema changes / 应用数据库结构变更:**

```sh
DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-) npx drizzle-kit push
```

There is no migrations folder — `drizzle-kit push` compares the whole schema against the database. **It can propose destructive statements, so review what it plans before running it against real data.**
项目没有迁移文件目录，`drizzle-kit push` 会将整个 schema 与数据库比对。**它可能生成破坏性语句，对含真实数据的数据库执行前务必先查看其执行计划。**

## D4. Environment variables / 环境变量

| Variable | Purpose / 用途 |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string / 数据库连接串 |
| `BETTER_AUTH_SECRET` | Signs member sessions **and** admin tokens / 同时用于会员会话与后台令牌签名 |
| `NEXT_PUBLIC_APP_URL` | The site's own origin. **Every link and image in every email is built from this** — must be updated at the domain cutover / 站点自身地址。**所有邮件中的链接与图片均基于此生成**，域名切换时必须更新 |
| `NEXT_PUBLIC_SITE_URL` | Base URL for the sitemap. Currently unset, so the sitemap publishes a per-deployment hostname — **set this at the cutover** / 站点地图使用的基础地址。目前未设置，导致站点地图输出的是每次部署生成的临时域名，**切换域名时必须设置** |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | The owner admin account / 管理员账号 |
| `ADMIN_ACCOUNTS` | Additional staff: `username:password:role`, comma or newline separated. An unknown role is dropped, never defaulted / 其他员工账号，格式为 `用户名:密码:角色`，以逗号或换行分隔。角色无法识别时该条目被丢弃，不会赋予默认权限 |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Email sending / 邮件发送 |
| `CONTACT_TO_EMAIL`, `CONTACT_TO_<CATEGORY>` | Override a contact category's address without a deploy / 无需重新部署即可修改咨询类别的收件地址 |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `SANITY_API_TOKEN` | Content / 内容管理 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` / `_API_SECRET` | Image uploads / 图片上传 |
| `SERIAL_VALIDATION_ENDPOINT` / `_API_KEY` | Optional external serial database (D7) / 可选的外部编号校验接口 |
| `NEXT_PUBLIC_AUTH_TWO_FACTOR` | `true` switches TOTP on / 设为 `true` 启用双重验证 |
| `NEXT_PUBLIC_AUTH_EMAIL_VERIFICATION` | `true` requires email confirmation before first sign-in / 设为 `true` 则首次登录前须验证邮箱 |
| `CRON_SECRET` | Protects the scheduled keep-alive route / 保护定时保活接口 |

## D5. Running and deploying / 运行与部署

```sh
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm test           # Playwright
```

**Deployment / 部署:** Vercel is connected to the repository, so **pushing to `main` deploys**. `vercel --prod` also deploys, but it uploads the working directory rather than a commit — always commit and push, or the next person's push will silently revert the work.
Vercel 已连接仓库，**推送到 `main` 分支即触发部署**。`vercel --prod` 同样可部署，但它上传的是本地工作目录而非某次提交，因此务必先提交并推送，否则下一个人的推送会悄悄覆盖你的改动。

A daily cron (`/api/cron/keep-alive`, 09:00) keeps the Railway database from idling. / 每日 09:00 的定时任务用于防止 Railway 数据库休眠。

## D6. Things to know before changing anything / 修改前须知

- **The serial number check is the only thing that grants a warranty.** The browser sends a `serialNumberValid` flag for its own display; the server ignores it and re-checks. / **只有服务端的编号校验才能授予保修。** 浏览器提交的 `serialNumberValid` 仅用于前端显示，服务端会忽略并重新校验。
- **A serial can only be registered once**, enforced by a unique index in the database, not only by the application check — two simultaneous submissions cannot both win. / **每个编号仅可登记一次**，由数据库唯一索引保证，而非仅靠应用层判断，因此并发提交不会同时成功。
- **Revoked and Abnormal serials are refused twice** — at the step-2 check and again on submit, because the status can change in between. / **已取消与异常编号会被校验两次**：第二步校验时与提交时，因为期间状态可能变化。
- **Email failures are never swallowed.** Better Auth's own send route answers 200 even when delivery fails, so the application sends verification mail itself and reports real failures. / **邮件发送失败不会被吞掉。** Better Auth 自带的发送接口即使投递失败也返回 200，因此应用自行发送验证邮件并如实上报失败。
- **Audit writes never throw.** A failed audit write is logged loudly but does not roll back the action it describes. / **写日志永不抛异常。** 日志写入失败会明确记录，但不会回滚其所描述的操作。
- **Email templates fall back to code.** An absent database row means "use the shipped wording", so improvements to defaults reach anything nobody has edited. / **邮件模板以代码为兜底。** 数据库中无记录即表示使用出厂文案，因此默认文案的改进会自动应用于未被编辑过的模板。

## D7. Not in Phase 1 / 第一阶段未包含

State these plainly in the delivered document. / 请在交付文档中如实说明。

| Item / 项目 | Status / 状态 |
|---|---|
| **Real serial number validation / 真实编号校验** | Serials are checked for *format only*. The factory has not supplied a database of issued numbers. Two routes are ready: import the numbers into the serial library, or set `SERIAL_VALIDATION_ENDPOINT` to check against a factory API. Until one is done, any correctly-formatted number is accepted. / 目前仅校验*格式*。工厂尚未提供已发出编号的数据。两条路径均已就绪：将编号导入编号库，或设置 `SERIAL_VALIDATION_ENDPOINT` 对接工厂接口。在此之前，任何格式正确的编号都会被接受。 |
| **Photo-assisted serial entry / 拍照识别编号** | Built at `/register?auto=true`, but the text-recognition add-on is not subscribed. Falls back to typing. / 已开发，但文字识别服务尚未订阅，目前回退为手动输入。 |
| **Two-factor authentication / 双重验证** | Built and working, switched off at the client's request. / 已开发可用，应客户要求关闭。 |
| **Email address confirmation / 邮箱验证** | Built and working, switched off at the client's request. / 已开发可用，应客户要求关闭。 |
| **Custom domain / 自有域名** | Site runs on its Vercel address. DNS records for the cutover supplied separately. / 目前使用 Vercel 提供的地址，域名切换所需 DNS 记录已另行提供。 |
| **Sending domain / 发信域名** | Email currently sends from the agency's domain. Moving it to JOMOO's own domain requires SPF, DKIM and DMARC records — supplied separately. / 目前使用代理商域名发信。迁移至 JOMOO 自有域名需配置 SPF、DKIM 与 DMARC 记录，已另行提供。 |
| **Ownership transfer / 所有权转移** | The table exists; there is no screen to use it. / 数据表已建，但尚无操作界面。 |

---

## Appendix 1 — Status reference / 附录一 — 状态对照

**Registration status / 登记状态**

| Status | Japanese | Meaning / 含义 |
|---|---|---|
| `PENDING` | 審査中 | Submitted, awaiting staff review / 已提交，待人工审核 |
| `RETURNED` | 要修正 | Sent back to the member for correction / 已退回，待会员修改 |
| `REGISTERED_NO_WARRANTY` | 登録済み | Accepted, outside the warranty window / 已受理，但不在保修范围内 |
| `REGISTERED_WITH_WARRANTY` | 登録済み（保証付き） | Accepted, warranty card issued / 已受理并签发保修卡 |

**Serial number status / 编号状态:** Unused 未使用 · Bound 已绑定 · Revoked 已取消 · Abnormal 异常 (see B5 / 见 B5)

**Audit actions / 日志操作类型:** Import 导入 · Create 新增 · Update 修改 · Delete 删除 · Bind 绑定 · Unbind 解绑 · Export 导出

## Appendix 2 — Serial number format / 附录二 — 编号格式

`J` followed by digits. The digit count varies by series: / `J` 加数字，位数因系列而异：

| Series / 系列 | Digits after J / J 之后的位数 |
|---|---|
| smart-toilet / 智能马桶 | 19 |
| shower-set / 淋浴花洒 | 20 |
| washstand / 洗面台 | 19 |
| faucets / 水龙头 | 19 |

Stored uppercase with spaces and dashes removed, so the same number typed differently still matches. Full-width digits from a Japanese keyboard are converted automatically.
存储时统一转为大写并去除空格与连字符，因此同一编号的不同输入方式仍能匹配。日文键盘输入的全角数字会自动转换。
