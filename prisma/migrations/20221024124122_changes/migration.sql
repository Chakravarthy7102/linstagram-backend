/*
  Warnings:

  - A unique constraint covering the columns `[follower_id,leader_id]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Follow_follower_id_leader_id_key" ON "Follow"("follower_id", "leader_id");
