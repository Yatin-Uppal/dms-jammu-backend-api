"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    const createProcedureSQL = `


CREATE PROCEDURE sp_dms_dashboard_data (IN start_date_param DATETIME, IN fmn_id INT)
BEGIN
DECLARE var_where_condition TEXT;
DECLARE end_date_param DATETIME;
SET @start_date_param = start_date_param;
SET @end_date_param = DATE_ADD(start_date_param, INTERVAL 52 HOUR);
SET @fmn_id = fmn_id;

IF fmn_id = 0 THEN
        SET var_where_condition = CONCAT('deleted_at IS NULL AND created_at >= @start_date_param AND created_at < @end_date_param');
ELSE
	SET var_where_condition = CONCAT(' deleted_at IS NULL AND created_at >= @start_date_param AND created_at < @end_date_param AND fmn_id = @fmn_id');
END IF;
 
SET @sql = CONCAT("
	    SELECT 
		b.id, b.record_id, b.vehicle_number_ba_number,a.*,
        f.formation_name,
            b.begin AS begin_time,
            b.end AS end_time
	    FROM driver_vehicle_details b
            LEFT JOIN 
            (SELECT
            	id as inner_id,
		record_id as inner_record_id,
		vehicle_number_ba_number as inner_vehicle_number_ba_number,
		MAX(
	CASE
		WHEN (series = 'M+4 - M+6') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+4 - M+6',
MAX(
	CASE
		WHEN (series = 'M+6 - M+8') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+6 - M+8',
MAX(
	CASE
		WHEN (series = 'M+8 - M+10') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+8 - M+10',
MAX(
	CASE
		WHEN (series = 'M+10 - M+12') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+10 - M+12',
MAX(
	CASE
		WHEN (series = 'M+12 - M+14') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+12 - M+14',
MAX(
	CASE
		WHEN (series = 'M+14 - M+16') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+14 - M+16',
MAX(
	CASE
		WHEN (series = 'M+16 - M+18') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+16 - M+18',
MAX(
	CASE
		WHEN (series = 'M+18 - M+20') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+18 - M+20',
MAX(
	CASE
		WHEN (series = 'M+20 - M+22') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+20 - M+22',
MAX(
	CASE
		WHEN (series = 'M+22 - M+24') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+22 - M+24',
MAX(
	CASE
		WHEN (series = 'M+24 - M+26') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+24 - M+26',
MAX(
	CASE
		WHEN (series = 'M+26 - M+28') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+26 - M+28',
MAX(
	CASE
		WHEN (series = 'M+28 - M+30') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+28 - M+30',
MAX(
	CASE
		WHEN (series = 'M+30 - M+32') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+30 - M+32',
MAX(
	CASE
		WHEN (series = 'M+32 - M+34') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+32 - M+34',
MAX(
	CASE
		WHEN (series = 'M+34 - M+36') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+34 - M+36',
MAX(
	CASE
		WHEN (series = 'M+36 - M+38') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+36 - M+38',
MAX(
	CASE
		WHEN (series = 'M+38 - M+40') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+38 - M+40',
MAX(
	CASE
		WHEN (series = 'M+40 - M+42') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+40 - M+42',
MAX(
	CASE
		WHEN (series = 'M+42 - M+44') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+42 - M+44',
MAX(
	CASE
		WHEN (series = 'M+44 - M+46') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+44 - M+46',
MAX(
	CASE
		WHEN (series = 'M+46 - M+48') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+46 - M+48',
MAX(
	CASE
		WHEN (series = 'M+48 - M+50') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+48 - M+50',
MAX(
	CASE
		WHEN (series = 'M+50 - M+52') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+50 - M+52',
MAX(
	CASE
		WHEN (series = 'M+52 - M+54') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+52 - M+54'
		FROM driver_vehicle_details a
		WHERE ", var_where_condition, "
		GROUP BY id,record_id, vehicle_number_ba_number
	    ) a
	    ON b.record_id = a.inner_record_id
         LEFT JOIN formations f ON f.id = b.fmn_id
	    WHERE deleted_at IS NULL AND b.created_at >= '", start_date_param ,"' AND b.created_at < '",DATE_ADD(start_date_param, INTERVAL 52 HOUR),
	    "' ORDER BY b.id;
		");
		
    -- Execute the dynamic SQL query
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    
    -- Deallocate the prepared statement
    DEALLOCATE PREPARE stmt;

END
    
    
    `;

    await queryInterface.sequelize.query(createProcedureSQL);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    const dropProcedureSQL = `
    DROP PROCEDURE IF EXISTS \`sp_dms_dashboard_data\`;
  `;

    await queryInterface.sequelize.query(dropProcedureSQL);
  },
};
