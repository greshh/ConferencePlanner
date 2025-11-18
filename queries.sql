SELECT t.`task_name`, t.`due_date`, t.`description`, c.`committee_name` "Committee Assigned", w.`workflow_name`, COALESCE(
    json_arrayagg(
      CASE 
        WHEN m.member_id IS NOT NULL
        THEN concat(m.first_name, ' ', m.last_name) 
      END
    ),
    json_array()
  ) as assigned_to
FROM `conference`.`task` t
JOIN `conference`.`task_committee` tc
	ON t.`task_id`=tc.`task_id`
JOIN `conference`.`committee` c
	ON c.`committee_id`=tc.`committee_id`
JOIN `conference`.`workflow_task` wt
	ON t.`task_id`=wt.`task_id`
JOIN `conference`.`workflow` w
	ON wt.`workflow_id`=w.`workflow_id`
LEFT JOIN `conference`.`assignment` a 
	ON t.`task_id`= a.`task_id`
LEFT JOIN `conference`.`member` m ON m.`member_id` = a.`member_id`
GROUP BY
  t.`task_id`, t.`task_name`, t.`due_date`, t.`description`,
  c.`committee_name`, w.`workflow_name`;
