SELECT first_name || ' ' || last_name AS "Name", average
FROM public."Player"
ORDER BY last_name asc, first_name ASC