!/usr/bin/env bash

### START - JXcore Test Server --------
### Make sure the script aborts after an error

NORMAL_COLOR='\033[0m'
RED_COLOR='\033[0;31m'
GREEN_COLOR='\033[0;32m'
GRAY_COLOR='\033[0;37m'

LOG() {
  COLOR="$1"
  TEXT="$2"
  echo -e "${COLOR}$TEXT ${NORMAL_COLOR}"
}


ERROR_ABORT() {
  if [[ $? != 0 ]]
  then
    LOG $RED_COLOR "compilation aborted\n"
    exit -1 
  fi
}
### END - JXcore Test Server   --------

pushd ./thali/install && ./setUpTests.sh && popd;ERROR_ABORT
pushd ../ThaliTest && cordova build android --device;ERROR_ABORT
