#!/usr/bin/env python3
"""Upload only an authenticated encrypted archive using a pre-provisioned SSH destination."""
import json,os,re,stat,subprocess,sys
from pathlib import Path

def upload(archive,config='/srv/medidesk/backup-offsite.json'):
    source=Path(archive);cfg=Path(config)
    if not source.is_file() or source.is_symlink() or not re.fullmatch(r'medidesk-[a-zA-Z0-9_.\-]+\.enc',source.name):raise ValueError('Encrypted archive required.')
    with source.open('rb') as stream:
        if stream.read(8)!=b'MDESK01\n':raise ValueError('Unexpected encrypted archive format.')
    if cfg.is_symlink() or cfg.stat().st_mode&0o077:raise ValueError('Off-site configuration must be private (mode 600).')
    options=json.loads(cfg.read_text())
    host,user,folder=options['host'],options['user'],options['directory']
    if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9.\-]*',host) or not re.fullmatch(r'[a-z_][a-z0-9_\-]*',user):raise ValueError('Invalid SSH host/user.')
    if not re.fullmatch(r'/[a-zA-Z0-9/_\-]+',folder) or '..' in folder:raise ValueError('Use a simple absolute remote directory.')
    port=int(options.get('port',22))
    if not 1<=port<=65535:raise ValueError('Invalid SSH port.')
    key,known=Path(options['identity_file']),Path(options['known_hosts'])
    if not key.is_absolute() or key.is_symlink() or not key.is_file() or key.stat().st_mode&0o077:raise ValueError('Private SSH identity required, mode 600.')
    if not known.is_absolute() or known.is_symlink() or not known.is_file() or known.stat().st_mode&0o022:raise ValueError('Verified, non-writable SSH known_hosts required.')
    destination=f'{user}@{host}:{folder.rstrip("/")}/{source.name}'
    subprocess.run(['scp','-P',str(port),'-i',str(key),'-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o',f'UserKnownHostsFile={known}','-o','ConnectTimeout=15','--',str(source),destination],check=True,timeout=180)
    print('Encrypted off-site transfer completed. Verify a restore from the remote copy separately.')
if __name__=='__main__':
    try:upload(sys.argv[1],sys.argv[2] if len(sys.argv)>2 else '/srv/medidesk/backup-offsite.json')
    except Exception:print('Off-site backup failed. Check the private configuration, SSH identity and verified host key.',file=sys.stderr);sys.exit(1)
