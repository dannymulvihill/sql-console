<?php

require 'RunQueryBase.php';

/*
 * This is the default subclass
 */
class RunQueryPDO extends RunQueryBase
{
	public function __construct()
	{
		parent::__construct();

		$pdo_string = 'mysql:host=localhost;dbname=twitter_test';
		$pdo_user   = 'sql_console_demo';
		$pdo_pass   = 'SHlg3902Txl8sa';

		$this->db = new PDO($pdo_string, $pdo_user, $pdo_pass);
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
	}

	public function query($sql)
	{
		$stmt = $this->db->prepare($sql);
	    $stmt->execute();

	    $this->result = $stmt->fetchAll();

	    $this->result_count = $stmt->rowCount();
	}

	public function buildResultInfo()
	{
		$s = ($this->result_count !== 1) ? 's' : '';
        $time = 1;
        $this->output .= $this->result_count.' row'.$s.' in set. <br/><br/>'; // time not available in PDO
	}
}