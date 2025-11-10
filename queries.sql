SELECT pc.`first_name`, c.`committee_name`
FROM `conference`.`parent_coordinator` pc, `conference`.`committee` c, `conference`.`committee_parent` cp
WHERE pc.`parent_coordinator_id` = cp.`parent_id`
AND c.`committee_id` = cp.`committee_id`;