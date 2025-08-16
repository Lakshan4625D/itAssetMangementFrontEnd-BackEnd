import boto3
import mysql.connector
from botocore.exceptions import BotoCoreError, NoCredentialsError, ClientError
from mysql.connector import Error

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'network_scanner'
}

def get_aws_resources(access_key, secret_key, region='us-east-1'):
    result = {
        "ec2_instances": [],
        "s3_buckets": [],
        "ecs_clusters": [],
        "iam_users": [],
        "error": None
    }

    try:
        # AWS Clients
        ec2 = boto3.client('ec2', aws_access_key_id=access_key,
                           aws_secret_access_key=secret_key, region_name=region)
        s3 = boto3.client('s3', aws_access_key_id=access_key,
                          aws_secret_access_key=secret_key)
        ecs = boto3.client('ecs', aws_access_key_id=access_key,
                           aws_secret_access_key=secret_key, region_name=region)
        iam = boto3.client('iam', aws_access_key_id=access_key,
                           aws_secret_access_key=secret_key)

        # Connect to DB
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Create Tables (if not exist)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cloud_scan_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                provider ENUM('aws','azure','gcp') NOT NULL,
                scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS aws_ec2 (
                id VARCHAR(100) PRIMARY KEY,
                type VARCHAR(50),
                state VARCHAR(50),
                launch_time DATETIME,
                public_ip VARCHAR(50),
                region VARCHAR(50),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS aws_s3 (
                name VARCHAR(100) PRIMARY KEY,
                creation_date DATETIME,
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS aws_ecs (
                name VARCHAR(100) PRIMARY KEY,
                status VARCHAR(50),
                active_services INT,
                running_tasks INT,
                region VARCHAR(50),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS aws_iam_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scan_id INT,
                username VARCHAR(255),
                created DATETIME,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        # Insert Scan Record
        cursor.execute("INSERT INTO cloud_scan_history (provider) VALUES ('aws')")
        scan_id = cursor.lastrowid

        # EC2 Instances
        ec2_data = ec2.describe_instances()
        for reservation in ec2_data['Reservations']:
            for instance in reservation['Instances']:
                instance_id = instance.get('InstanceId')
                instance_type = instance.get('InstanceType')
                state = instance.get('State', {}).get('Name')
                launch_time = instance.get('LaunchTime')
                public_ip = instance.get('PublicIpAddress', 'N/A')

                result['ec2_instances'].append({
                    'instance_id': instance_id,
                    'type': instance_type,
                    'state': state,
                    'launch_time': str(launch_time),
                    'public_ip': public_ip
                })

                cursor.execute('''
                    INSERT INTO aws_ec2 (id, type, state, launch_time, public_ip, region, scan_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        type=VALUES(type), state=VALUES(state), launch_time=VALUES(launch_time),
                        public_ip=VALUES(public_ip), region=VALUES(region), scan_id=VALUES(scan_id)
                ''', (instance_id, instance_type, state, launch_time, public_ip, region, scan_id))

        # S3 Buckets
        buckets_data = s3.list_buckets()
        for b in buckets_data.get('Buckets', []):
            name = b['Name']
            creation_date = b['CreationDate']
            result['s3_buckets'].append({'name': name, 'creation_date': str(creation_date)})

            cursor.execute('''
                INSERT INTO aws_s3 (name, creation_date, scan_id)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    creation_date=VALUES(creation_date), scan_id=VALUES(scan_id)
            ''', (name, creation_date, scan_id))

        # ECS Clusters
        cluster_arns = ecs.list_clusters().get('clusterArns', [])
        for arn in cluster_arns:
            cluster_desc = ecs.describe_clusters(clusters=[arn])
            for c in cluster_desc.get('clusters', []):
                cluster_name = c.get('clusterName')
                status = c.get('status')
                active_services = c.get('activeServicesCount', 0)
                running_tasks = c.get('runningTasksCount', 0)

                result['ecs_clusters'].append({
                    'cluster_name': cluster_name,
                    'status': status,
                    'active_services': active_services,
                    'running_tasks': running_tasks
                })

                cursor.execute('''
                    INSERT INTO aws_ecs (name, status, active_services, running_tasks, region, scan_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        status=VALUES(status), active_services=VALUES(active_services),
                        running_tasks=VALUES(running_tasks), region=VALUES(region), scan_id=VALUES(scan_id)
                ''', (cluster_name, status, active_services, running_tasks, region, scan_id))

        # IAM Users
        users = iam.list_users().get('Users', [])
        for user in users:
            username = user.get("UserName")
            created = user.get("CreateDate")

            result['iam_users'].append({
                "username": username,
                "created": str(created)
            })

            cursor.execute('''
                INSERT INTO aws_iam_users (scan_id, username, created)
                VALUES (%s, %s, %s)
            ''', (scan_id, username, created))

        conn.commit()

    except (BotoCoreError, NoCredentialsError, ClientError, Error) as e:
        result['error'] = str(e)

    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

    return result
