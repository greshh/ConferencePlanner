@echo off
cd prisma
call npx prisma db pull
call npx prisma generate
cd ..