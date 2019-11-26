cd "$(dirname "$0")";

while getopts ":u:" opt; do
	case $opt in
		u)
			curl -s $OPTARG > config.js
			;;
		
		\?)
			echo "Unknown option: -$OPTARG"
			exit 1
			;;
		:)
			echo "Option -$OPTARG requires an argument."
			exit 1
			;;
	esac
done

node index.js
