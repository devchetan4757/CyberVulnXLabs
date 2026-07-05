import express from "express";

const router = express.Router();

function legacyWaf(req, res, next) {
  const raw = req.originalUrl;

  if (raw === "/admin" || raw === "/admin/") {
    return res.status(403).json({
      blocked: true,
      message: "403 Blocked by WAF — Access Denied"
    });
  }

  next();
}

router.get("/", legacyWaf, (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>CyberVulnX Internal Dashboard</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{
font-family:Inter,"Segoe UI",sans-serif;
background:#f5f5f5;
color:#222;
}

.container{
    width:100%;
    max-width:1700px;
    margin:0 auto;
    padding:40px 60px;
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
padding-bottom:20px;
border-bottom:2px solid #c82026;
margin-bottom:30px;
flex-wrap:wrap;
gap:15px;
}

.logo h1{
font-size:1.5rem;
color:#c82026;
margin-bottom:5px;
}

.logo p{
color:#666;
font-size:.9rem;
}

.badge{
background:#c82026;
color:#fff;
padding:5px 12px;
font-size:.7rem;
font-weight:700;
border-radius:4px;
letter-spacing:.08em;
}

.banner{
background:#fff;
border-left:5px solid #c82026;
padding:18px 22px;
margin-bottom:28px;
border:1px solid #e5e5e5;
}

.banner h2{
font-size:1rem;
margin-bottom:8px;
color:#c82026;
}

.banner p{
color:#666;
line-height:1.7;
font-size:.92rem;
}

.stats{
    display:grid;
    grid-template-columns:repeat(4,minmax(220px,1fr));
    gap:18px;
    margin-bottom:30px;
}

.grid{
    display:grid;
    grid-template-columns:2fr 1fr;
    gap:22px;
    margin-bottom:30px;
}

.card{
background:#fff;
border:1px solid #e5e5e5;
padding:20px;
}

.label{
font-size:.72rem;
text-transform:uppercase;
letter-spacing:.06em;
color:#777;
margin-bottom:10px;
}

.value{
font-size:1.6rem;
font-weight:700;
}

.green{
color:#2ecc71;
}


.panel{
background:#fff;
border:1px solid #e5e5e5;
}

.panel-header{
background:#111;
color:#fff;
padding:12px 18px;
font-size:.85rem;
font-weight:600;
letter-spacing:.04em;
}

.panel-body{
padding:20px;
}

.info-row{
display:flex;
justify-content:space-between;
padding:10px 0;
border-bottom:1px solid #eee;
font-size:.92rem;
}

.info-row:last-child{
border-bottom:none;
}

.secret{
margin-top:18px;
background:#111;
color:#2ecc71;
padding:16px;
font-family:Consolas,monospace;
border-radius:4px;
word-break:break-word;
}

.footer{
margin-top:30px;
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
gap:15px;
}

.back{
text-decoration:none;
border:1px solid #ddd;
padding:10px 18px;
color:#444;
transition:.2s;
}

.back:hover{
border-color:#c82026;
color:#c82026;
}

.notice{
font-size:.85rem;
color:#777;
}

@media (max-width:1200px){

.container{
    padding:35px 40px;
}

.stats{
    grid-template-columns:repeat(2,1fr);
}

}

@media (max-width:768px){

.container{
    padding:25px 20px;
}

.grid{
    grid-template-columns:1fr;
}

.stats{
    grid-template-columns:1fr 1fr;
}

.header{
    flex-direction:column;
    align-items:flex-start;
}

.footer{
    flex-direction:column;
    align-items:flex-start;
}

}

@media (max-width:480px){

.container{
    padding:18px 15px;
}

.stats{
    grid-template-columns:1fr;
}

.logo h1{
    font-size:1.3rem;
}

.banner{
    padding:16px;
}

.panel-body{
    padding:16px;
}

.info-row{
    flex-direction:column;
    gap:5px;
    align-items:flex-start;
}

.back{
    width:100%;
    text-align:center;
}

}
</style>

</head>

<body>

<div class="container">

<div class="header">

<div class="logo">
<h1>CyberVulnX Admin Panel</h1>
<p>Internal Administration Portal</p>
</div>

<div class="badge">
INTERNAL
</div>

</div>

<div class="banner">

<h2>Internal Administration</h2>

<p>
Authenticated administrator session established.
Manage platform information and internal configuration from this dashboard.
</p>

</div>

<div class="stats">

<div class="card">
<div class="label">Members</div>
<div class="value">1,482</div>
</div>

<div class="card">
<div class="label">Labs</div>
<div class="value">7</div>
</div>

<div class="card">
<div class="label">Server</div>
<div class="value green">ONLINE</div>
</div>

<div class="card">
<div class="label">Version</div>
<div class="value">v2.1</div>
</div>

</div>
<div class="grid">

<div class="panel">

<div class="panel-header">
System Information
</div>

<div class="panel-body">

<div class="info-row">
<span>Hostname</span>
<strong>cvx-admin-01</strong>
</div>

<div class="info-row">
<span>Environment</span>
<strong>Production</strong>
</div>

<div class="info-row">
<span>Database</span>
<strong>Connected</strong>
</div>

<div class="info-row">
<span>Server Status</span>
<strong style="color:#2ecc71;">Healthy</strong>
</div>

<div class="info-row">
<span>Node Version</span>
<strong>v22.4.0</strong>
</div>

<div class="info-row">
<span>Last Backup</span>
<strong>Today 02:15 UTC</strong>
</div>

</div>

</div>

<div class="panel">

<div class="panel-header">
Internal Secret
</div>

<div class="panel-body">

<p style="color:#666;line-height:1.6;">
Administrative verification token.
Keep this value confidential.
</p>

<div class="secret">
CVX{w4f_byp4ss_succ3ss}
</div>

</div>

</div>

</div>

<div class="footer">

<a href="/" class="back">
← Back to Lab
</a>

<div class="notice">
CyberVulnX Internal Dashboard
</div>

</div>

</div>

</body>

</html>
  `);
});

export default router;
