const {defineConfig, devices}=require('@playwright/test');

module.exports=defineConfig({
  testDir:'./tests/e2e',
  outputDir:'artifacts/playwright/results',
  reporter:[['list'],['html',{outputFolder:'artifacts/playwright/report',open:'never'}]],
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    video:'retain-on-failure'
  },
  webServer:{
    command:'npx http-server . -p 4173 -c-1 --silent',
    url:'http://127.0.0.1:4173/',
    reuseExistingServer:true,
    timeout:30000
  },
  projects:[
    {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chromium',use:{...devices['iPhone 13']}}
  ]
});
