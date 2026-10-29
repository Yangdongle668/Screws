import fs from 'node:fs';
// Only the fixed persistent mount and its fixed subdirectories are initialized.
for(const dir of ['/data','/data/drawings','/data/smtp-receipts']){fs.mkdirSync(dir,{recursive:true,mode:0o700});fs.chownSync(dir,1000,1000);fs.chmodSync(dir,0o700);}
