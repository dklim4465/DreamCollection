create database webdb; 
use webdb; 
CREATE USER 'username'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON webdb.* TO 'username'@'localhost';

CREATE TABLE webdb.tbl_todo (
                                tno INT AUTO_INCREMENT PRIMARY KEY,
                                title VARCHAR(100) NOT NULL,
                                dueDate DATE NOT NULL,
                                finished TINYINT DEFAULT 0,
                                writer VARCHAR(100)
);

insert into tbl_todo (title, dueDate, finished) values ('Test...', '2026-05-05', 1);

select * from tbl_todo;
select * from tbl_todo where tno > 3;

update tbl_todo set finished =0, title ='Not Yet...' where tno = 4;
delete from tbl_todo where tno > 3;

select now();

create table tbl_member(
   mid varchar(50) primary key,
   mpw varchar(50) not null,
   mname varchar(100) not null
   );
    
insert into tbl_member (mid, mpw, mname) values('user00', '1111', '사용자0');
insert into tbl_member (mid, mpw, mname) values('user01', '1111', '사용자1');
insert into tbl_member (mid, mpw, mname) values('user02', '1111', '사용자2');

select * from tbl_member where mid='user00' and mpw='1111';
select * from tbl_member;
    
alter table tbl_member add column uuid varchar(50);

drop table tbl_member;

select * from board order by bno desc;
select* from board where bno=100;

    
create table tbl_todo(
   tno int auto_increment primary key,
   title varchar(100) not null,
   dueDate date not null,
   writer varchar(50) not null,
   finished tinyint default 0
);
select * from tbl_todo;
select * from tbl_todo;
    
  insert into tbl_todo (title, dueDate, writer) (select title, dueDate, writer from tbl_todo);  
    
    DELETE FROM tbl_todo WHERE tno > 1500;
    
    select * from tbl_todo order by tno desc;
    select count(tno) from tbl_todo;
    
    select * from tbl_todo order by tno desc limit 10;
    
    select*from board where(title like concat('%',1,'%') or content like concat('%','1','%')) order by bno desc;