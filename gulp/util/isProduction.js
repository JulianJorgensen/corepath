var isProduction;

if (process.env['DEPLOYBOT_ENVIRONMENT'] != null){
  isProduction = true;
}else{
  isProduction = false;
}

module.exports = isProduction;
