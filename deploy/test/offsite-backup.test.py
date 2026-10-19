import importlib.util,tempfile,unittest,json,os,subprocess
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('offsite',Path(__file__).resolve().parents[1]/'backup-offsite.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class OffsiteTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  self.archive=self.root/'medidesk-fixture.sqlite.enc';self.archive.write_bytes(b'MDESK01\n'+b'x'*50)
  self.key=self.root/'identity';self.key.write_text('test identity placeholder');self.key.chmod(0o600)
  self.known=self.root/'known';self.known.write_text('test host placeholder');self.known.chmod(0o600)
  self.config=self.root/'config.json';self.options={'host':'backup.example.test','user':'medidesk','directory':'/backups/medidesk','identity_file':str(self.key),'known_hosts':str(self.known)};self.save()
 def tearDown(self):self.tmp.cleanup()
 def save(self):self.config.write_text(json.dumps(self.options));self.config.chmod(0o600)
 @patch.object(module.subprocess,'run')
 def test_encrypted_only_strict_host_keys_and_no_shell(self,run):
  module.upload(self.archive,self.config);args,kwargs=run.call_args;command=args[0];self.assertIn('StrictHostKeyChecking=yes',command);self.assertIn('BatchMode=yes',command);self.assertNotIn('shell',kwargs);self.assertTrue(kwargs['check'])
 @patch.object(module.subprocess,'run')
 def test_plaintext_and_unsafe_destinations_refused(self,run):
  self.archive.write_text('SQLite plaintext');self.assertRaises(ValueError,module.upload,self.archive,self.config);run.assert_not_called()
 @patch.object(module.subprocess,'run')
 def test_host_command_injection_refused(self,run):
  self.options['host']='-oProxyCommand=touch /tmp/unsafe';self.save();self.assertRaises(ValueError,module.upload,self.archive,self.config);run.assert_not_called()
 @patch.object(module.subprocess,'run')
 def test_broad_private_key_permissions_refused(self,run):
  self.key.chmod(0o644);self.assertRaises(ValueError,module.upload,self.archive,self.config);run.assert_not_called()
 @patch.object(module.subprocess,'run',side_effect=subprocess.CalledProcessError(1,['scp']))
 def test_transfer_failure_propagates_without_deleting_local_archive(self,run):
  self.assertRaises(subprocess.CalledProcessError,module.upload,self.archive,self.config);self.assertTrue(self.archive.exists())
if __name__=='__main__':unittest.main()
