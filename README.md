SQL-Console

This little project started as a way to get database access for SugarCRM customers in the OnDemand environment.
Currently all the Sugar stuff is stripped out.

Here is a demo: http://sql-console.ninjacode.co/

Go ahead and show tables, desc tables etc to get an idea.

Database user is readonly obviously.


@todos
* classify the query code - done
* separate out the db source (sugarcrm, pdo, wp, drupal, etc)
* fix result count for update statements
* determine if exec time is possible with PDO, get crazy if necessary
* settings tab: need to modify the exit console option depending on the usage (sugar, wp, drupal, etc)
* create a shortcut to easily jump to insert mode in text area