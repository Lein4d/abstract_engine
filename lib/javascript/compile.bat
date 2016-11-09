
del %~dp0\abstract_engine.js

for /r %~dp0\src %%f in (*.js) do type "%%f" >> abstract_engine.js

..\..\3rd_party\flow\flow check abstract_engine.js

flow-remove-types abstract_engine.js --out-dir .
