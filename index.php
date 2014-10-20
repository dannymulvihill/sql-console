<html>
<head>
    <title>SQL Console</title>
    <link rel="icon" type="image/png" href="favicon.png" />
    <link href='vendor/css/bootstrap.min.css' rel='stylesheet' type='text/css'>
    <link href='css/style.css' rel='stylesheet' type='text/css'>
    <script src='vendor/js/jquery-min.1.11.0.js'></script>
    <script src='vendor/js/bootstrap.min.js'></script>
</head>

<body class="tron">
<div class="dropdown settings pull-right">
    <a class="dropdown-toggle" data-toggle="dropdown" href="#">Themes</a>
    <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
        <li role="presentation" class="theme tron" data-theme="tron"><a role="menuitem" href="#">Tron</a></li>
        <li role="presentation" class="theme solarized" data-theme="solarized"><a role="menuitem" href="#">Solarized</a></li>
        <li role="presentation" class="theme spark" data-theme="spark"><a role="menuitem" href="#">Spark</a></li>
    </ul>
</div>


<div class="history tron"></div>
<textarea class="console tron"></textarea>

<script type="text/javascript" src="js/sql-console.js"></script>

</body>
</html>