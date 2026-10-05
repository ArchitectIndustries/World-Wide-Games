from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[1]
summary=json.loads((ROOT/'tests/v60_full_catalog_fast_summary.json').read_text())
results=json.loads((ROOT/'tests/v60_full_catalog_fast_results.json').read_text())
node="const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(c.window.WWG_GAMES.length)"
catalog_count=int(subprocess.check_output(['node','-e',node],cwd=ROOT,text=True).strip())
assert catalog_count==82
assert summary['games']==82 and summary['passed']==82 and summary['checks']==[]
assert summary['runtime_errors']=={} and summary['audit_errors']=={} and summary['missing_refs']=={}
assert summary['mobile_overflow']==[] and summary['bad_text']==[]
assert results['games']==82 and results['passed']==82 and results['failed']==0
print(json.dumps({'catalogGames':catalog_count,'interactionAudit':'82/82','runtimeErrors':0,'missingRefs':0,'mobileOverflow':0}))
