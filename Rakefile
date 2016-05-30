require 'rubygems'
require 'bundler'
require 'rake'
require 'fileutils'
Bundler.setup(:default, :deploy)
require 'aws-sdk'
require 'deep_merge'

Dir.glob('_tasks/*.rake') do |f|
  load f
end

module CoverallCrew
  module AWS
    class EC2
      def self.get_ec2_servers

        ec2_servers = []

        credentials = Aws::Credentials.new('AKIAJG6QNL7LBC3QWDCQ', 'ghnPIs45Dj0osLYwJ3MBSch+jvFeOT6RjPKDPzcq')

        regions = [ 'us-west-2', 'us-west-1', 'us-east-1', 'eu-central-1', 'ap-southeast-2' ] #::AWS::EC2.new.regions.map(&:name)

        regions.each do |region|
          puts "Looking for instances in #{region}..."
          client = Aws::EC2::Client.new(region: region, credentials: credentials)
          #vpc_id = client.describe_vpcs[:vpcs].first[:vpc_id]
          #vpc = Aws::EC2::Vpc.new(vpc_id, client: client)

          #vpc.instances(filters: [ { 'name' => 'tag:production', 'values' => [ 'true' ] } ]).each do |i|
          client.describe_instances(filters: [ { 'name' => 'tag:production', 'values' => [ 'true' ] } ])[:reservations].each do |r|
            r.instances.each do |i|
              if i.state.name == 'running'
                puts "Found #{i.public_dns_name}"
                ec2_servers << i.public_dns_name
              end
            end
          end
        end

        ec2_servers
      end
    end

    class CloudFront
      def self.get_distributions
        if Object.const_defined?("SafeYAML")
          SafeYAML::OPTIONS[:default_mode] = :unsafe # or :unsafe
        end
        ::AWS.config(CoverallCrew::AWS::CONFIG)

        client = ::AWS::CloudFront::Client.new
        distributions = client.list_distributions
        distributions.data[:items]
      end

      def self.get_distribution
        if Object.const_defined?("SafeYAML")
          SafeYAML::OPTIONS[:default_mode] = :unsafe # or :unsafe
        end
        distribution = nil
        self.get_distributions.each do |d|
          d[:aliases][:items].each do |a|
            if a == 'max.adobe.com'
              distribution = d
            end
          end
        end
        distribution
      end

      def self.create_invalidation(paths)
        if Object.const_defined?("SafeYAML")
          SafeYAML::OPTIONS[:default_mode] = :unsafe # or :unsafe
        end
        ::AWS.config(CoverallCrew::AWS::CONFIG)

        paths = paths.map { |p| p.gsub(/index.html/, '') }
        client = ::AWS::CloudFront::Client.new
        distribution = get_distribution

        invalidation = { :distribution_id => distribution[:id], :invalidation_batch => { :paths => {}, :caller_reference => Time.now.to_s } }
        invalidation[:invalidation_batch][:paths] = {
          :quantity => paths.length,
          :items    => paths,
        }
        puts "Invalidating #{paths.length} objects from CloudFront cache... (can take 10-15 minutes)"
        response = client.create_invalidation(invalidation)
      end
    end
  end
end
