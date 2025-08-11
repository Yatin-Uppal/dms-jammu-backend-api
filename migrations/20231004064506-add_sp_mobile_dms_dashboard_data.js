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
    CREATE PROCEDURE sp_mobile_dms_dashboard_data (
      IN start_date_param DATETIME,
      IN series_param VARCHAR(255)
    )
    BEGIN DECLARE var_where_condition TEXT;
    
    DECLARE end_date_param DATETIME;
    
    SET
      @start_date_param = start_date_param;
    
    SET
      @end_date_param = DATE_ADD(start_date_param, INTERVAL 52 HOUR);
    
    
    SET
      var_where_condition = CONCAT(
        'deleted_at IS NULL AND created_at >= @start_date_param AND created_at < @end_date_param'
      );
    
    
    
    SET
      @sql = CONCAT(
        "
          SELECT 
        b.id, b.record_id, b.vehicle_number_ba_number,a.*,
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
                            WHEN (series = '",
        series_param,
        "') THEN
                                CASE
                                    WHEN (
                                        SELECT IFNULL(end, '2')
                                        FROM driver_vehicle_details d1
                                        WHERE d1.record_id = a.record_id AND d1.deleted_at IS NULL
                                    ) != '2' THEN 'Green'
                                    WHEN (
                                        SELECT IFNULL(begin, '1')
                                        FROM driver_vehicle_details d2
                                        WHERE d2.record_id = a.record_id AND d2.deleted_at IS NULL
                                    ) != '1' THEN 'Blue'
                                    WHEN (
                                        SELECT IFNULL(vehicle_number_ba_number, '') = '' OR IFNULL(driver_name, '') = ''
                                        FROM driver_vehicle_details d3
                                        WHERE d3.record_id = a.record_id AND d3.deleted_at IS NULL
                                    ) THEN 'Yellow'
                                    ELSE 'No Activity'
                                END
                            ELSE NULL
                        END
                    ) AS 'SelectedSeries'
        FROM driver_vehicle_details a
        WHERE ",
        var_where_condition,
        "
        GROUP BY id,record_id, vehicle_number_ba_number
          ) a
          ON b.record_id = a.inner_record_id
          WHERE deleted_at IS NULL AND b.created_at >= '",
        start_date_param,
        "' AND b.created_at < '",
        DATE_ADD(start_date_param, INTERVAL 52 HOUR),
        "' ORDER BY b.id;
        "
      );
    
    -- Execute the dynamic SQL query
    PREPARE stmt
    FROM
      @sql;
    
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
    DROP PROCEDURE IF EXISTS \`sp_mobile_dms_dashboard_data\`;
  `;

    await queryInterface.sequelize.query(dropProcedureSQL);
  },
};
