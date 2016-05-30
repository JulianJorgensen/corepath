namespace :aws do
  desc 'List CloudFront distributions'
  task :list_cloudfront_distributions do
    puts CoverallCrew::AWS::CloudFront.get_distributions.inspect
  end

  desc 'List EC2 instances'
  task :list_ec2_instances do
    puts CoverallCrew::AWS::EC2.get_ec2_servers
  end

  desc 'Get max.adobe.com distribution'
  task :get_max_distribution do
    puts CoverallCrew::AWS::CloudFront.get_distribution.inspect
  end
end


