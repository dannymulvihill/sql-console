<?php

/**
 * This is the base class for consuming, executing and formatting queries and their results.
 */

abstract class RunQueryBase
{
	protected $db;
	protected $format;
	protected $field_length_map = array();
    protected $key_length_map = array();
    protected $result_count;
    protected $max_key_len;
    protected $result;
	protected $output;

    public function __construct()
    {
    	$this->format = $_POST['format'];
    }

	/*
	 * This method MUST be overridden in subclass.
	 */
	public function query() {}

    /*
     * Prints the formatted results for the ajax method to consume and return to console window.
     */
	public function output()
	{
		$this->preFormat();
		$this->format();
		$this->buildResultInfo();

		echo $this->output;
	}

    /*
     * Determine the max column value length and key value length. This is critical in formatting the output.
     *
     * @todo - it is likely possible to acheive the formatting with css instead of preformatted text
     *       - would also be worth looking into handling the formatting in javascript to avoid sending back
     *         so much data. just return results in JSON
     */
	protected function preFormat()
	{
        foreach ($this->result as $row)
        {
            foreach ($row as $key => $item)
            {
                $item_len = strlen($item);
                $key_len  = strlen($key);

                $length = ($item_len > $key_len) ? $item_len : $key_len;

                $this->max_key_len = ($key_len > $this->max_key_len) ? $key_len : $this->max_key_len;

                // first if statement is mostly here to keep php log free of Undefined index notices
                if (!isset($this->field_length_map[$key]))
                {
                    $this->field_length_map[$key] = $length;
                }
                else if ($this->field_length_map[$key] < $length)
                {
                    $this->field_length_map[$key] = $length;
                }

                $this->key_length_map[$key] = $key_len;
            }
        }
	}

    /*
     * Use the field and key length arrays to generate preformatted text for display in console window.
     */
	protected function format()
	{
		$header = true;
        $footer = false;
        $count  = 1;

        if ($this->format == 'normal')
        {
            foreach ($this->result as $row)
            {
                // print the header row (column names)
                if ($header)
                {
                    $this->output = '';
                    foreach ($row as $key => $item)
                    {
                        // top line
                        $this->output .= '+-';
                        for ($i = 1; $i < $this->field_length_map[$key]; $i++)
                        {
                           $this->output .= '-';
                        }
                        $this->output .= '--';
                    }

                    // add an extra space so the right edge isn't flush against browser window
                    $this->output .= '+&nbsp;<br/>';

                    foreach ($row as $key => $item)
                    {
                        // column names
                        $this->output .= '| ';
                        $len = strlen($key);
                        $this->output .= $key;
                        for ($i = $len; $i < $this->field_length_map[$key]; $i++)
                        {
                            $this->output .= "&nbsp;";
                        }
                        $this->output .= '&nbsp;';
                    }

                    $this->output .= '|<br/>';
                    foreach ($row as $key => $item)
                    {
                        // bottom line
                        $this->output .= '+-';
                        for ($i = 1; $i < $this->field_length_map[$key]; $i++)
                        {
                            $this->output .= '-';
                        }
                        $this->output .= '--';
                    }

                    $this->output .= '+<br/>';

                    $header = false;
                }

                foreach ($row as $key => $item)
                {
                    // column values
                    $this->output .= '| ';
                    $len = strlen($item);
                    $this->output .= $item;
                    for ($i = $len; $i < $this->field_length_map[$key]; $i++)
                    {
                        $this->output .= "&nbsp;";
                    }
                    $this->output .= '&nbsp;';
                }
                $count++;

                $this->output .= '|<br/>';

                // build the footer output
                if ($count > $this->result_count)
                {
                    foreach ($row as $key => $item)
                    {
                        // bottom line
                        $this->output .= '+-';
                        for ($i = 1; $i < $this->field_length_map[$key]; $i++)
                        {
                            $this->output .= '-';
                        }
                        $this->output .= '--';
                    }

                    $this->output .= '+<br/>';
                }
            }
        }
        else if ($this->format == 'stacked')
        {
            foreach ($this->result as $row)
            {
                if ($header)
                {
                    $this->output .= '*************************** '.$count++.'. row ***************************<br/>';
                    $header = false;
                }

                foreach ($row as $key => $item)
                {
                    $rem = $this->max_key_len - $this->key_length_map[$key];

                    for ($i = 1; $i < $rem; $i++)
                    {
                        $this->output .= '&nbsp;';
                    }
                    $this->output .= $key.': '.$item.'<br/>';
                }

                $header = true;
            }
        }
	}
}