-- CreateTable
CREATE TABLE `assignment` (
    `assignment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NULL,
    `member_id` INTEGER NULL,
    `personal_notes` VARCHAR(100) NULL,

    INDEX `fk_member_id_idx`(`member_id`),
    INDEX `fk_task_id_idx`(`task_id`),
    PRIMARY KEY (`assignment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `committee` (
    `committee_id` INTEGER NOT NULL AUTO_INCREMENT,
    `committee_name` VARCHAR(45) NOT NULL,
    `colour` VARCHAR(6) NULL,

    PRIMARY KEY (`committee_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `committee_parent` (
    `committee_parent_id` INTEGER NOT NULL AUTO_INCREMENT,
    `committee_id` INTEGER NULL,
    `parent_id` INTEGER NULL,

    INDEX `fk_committeeparent_committee_idx`(`committee_id`),
    INDEX `fk_committeeparent_parent_idx`(`parent_id`),
    PRIMARY KEY (`committee_parent_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member` (
    `member_id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(45) NOT NULL,
    `last_name` VARCHAR(45) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `chapter` VARCHAR(45) NOT NULL,
    `phone_number` VARCHAR(13) NULL,
    `email` VARCHAR(100) NULL,
    `is_committee_head` TINYINT NOT NULL,

    UNIQUE INDEX `member_id_UNIQUE`(`member_id`),
    PRIMARY KEY (`member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership` (
    `membership_id` INTEGER NOT NULL AUTO_INCREMENT,
    `committee_id` INTEGER NULL,
    `member_id` INTEGER NULL,

    INDEX `fk_membership_committee_idx`(`committee_id`),
    INDEX `fk_membership_member_idx`(`member_id`),
    PRIMARY KEY (`membership_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parent_coordinator` (
    `parent_coordinator_id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(45) NOT NULL,
    `last_name` VARCHAR(45) NOT NULL,
    `phone_number` VARCHAR(13) NULL,
    `email` VARCHAR(100) NULL,
    `spouse_id` INTEGER NULL,
    `title` VARCHAR(4) NULL,

    PRIMARY KEY (`parent_coordinator_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task` (
    `task_id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_name` VARCHAR(45) NOT NULL,
    `due_date` DATE NULL,
    `description` VARCHAR(1000) NULL,
    `completed` BOOLEAN NOT NULL,
    `attachments` JSON NULL,

    UNIQUE INDEX `Task_ID_UNIQUE`(`task_id`),
    PRIMARY KEY (`task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_committee` (
    `task_committee_id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NULL,
    `committee_id` INTEGER NULL,

    INDEX `fk_committee_id_idx`(`committee_id`),
    INDEX `fk_task_id_idx`(`task_id`),
    PRIMARY KEY (`task_committee_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow` (
    `workflow_id` INTEGER NOT NULL AUTO_INCREMENT,
    `workflow_name` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`workflow_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_task` (
    `workflow_task_id` INTEGER NOT NULL AUTO_INCREMENT,
    `workflow_id` INTEGER NULL,
    `task_id` INTEGER NULL,
    `order_index` INTEGER NOT NULL,

    INDEX `fk_workflowtask_task_idx`(`task_id`),
    INDEX `fk_workflowtask_workflow_idx`(`workflow_id`),
    PRIMARY KEY (`workflow_task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `fk_assignment_member` FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `fk_assignment_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`task_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `committee_parent` ADD CONSTRAINT `fk_committeeparent_committee` FOREIGN KEY (`committee_id`) REFERENCES `committee`(`committee_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `committee_parent` ADD CONSTRAINT `fk_committeeparent_parent` FOREIGN KEY (`parent_id`) REFERENCES `parent_coordinator`(`parent_coordinator_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `membership` ADD CONSTRAINT `fk_membership_committee` FOREIGN KEY (`committee_id`) REFERENCES `committee`(`committee_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `membership` ADD CONSTRAINT `fk_membership_member` FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `task_committee` ADD CONSTRAINT `fk_taskcommittee_committee` FOREIGN KEY (`committee_id`) REFERENCES `committee`(`committee_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `task_committee` ADD CONSTRAINT `fk_taskcommittee_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`task_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workflow_task` ADD CONSTRAINT `fk_workflowtask_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`task_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workflow_task` ADD CONSTRAINT `fk_workflowtask_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflow`(`workflow_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

