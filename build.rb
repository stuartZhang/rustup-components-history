#!/usr/bin/env ruby
#encoding=utf-8
require 'fileutils'
DEPLOY_PATH = "/home/ewhine/deploy/web_apps"
PROJECT_NAME = "rustup-components-history"
APP_PATH = "#{DEPLOY_PATH}/#{PROJECT_NAME}"
OLD_APP_PATH = "#{APP_PATH}.old"
OLD_DEPLOY_PATH = '#{DEPLOY_PATH}.old'

unless File.exist?(DEPLOY_PATH)
    FileUtils.mkdir_p DEPLOY_PATH
end

FileUtils.rm_rf OLD_APP_PATH
if File.exist?(APP_PATH)
    FileUtils.mv APP_PATH, OLD_APP_PATH
end

mv_cmd = "mv /home/ewhine/ewhine_pkg/* #{DEPLOY_PATH}/"
system mv_cmd

puts "更新成功"
