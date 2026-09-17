function motor_pump_app()
    clc;
    close all; % 'clear' is omitted as it is not recommended inside a function workspace

    %% INPUT PARAMETERS
    V_line       = 400.0;    
    f            = 60.0;  
    P            = 4;        
    connection   = 'Y';     
    
    %% DESIGN CLASS A
    R1           = 28.10;    
    X1           = 68.87;    
    R2_prime     = 18.23;     
    X2_prime     = 68.87;    
    Xm           = 121.9;     
    Rc           = 654.75;
    
    %% Rewinding & Physical Stator Data 
    stator_slots     = 24;
    turns_per_slot   = 99;   
    wire_gauge_SWG   = 24;   
    coils_used       = 12;  
    stator_ID_cm     = 6.5;  
    stator_OD_cm     = 13.0; 
    coil_pitch_slots = 2;    
    
    %% Operating Conditions
    s_rated          = 0.05; 
    
    %% SYNCHRONOUS SPEED & THEVENIN EQUIVALENT PARAMETERS
    %  Per-Phase Voltage
    if strcmpi(connection, 'Y')
        V_ph = V_line / sqrt(3);
    else
        V_ph = V_line;
    end
    
    % Synchronous Speeds 
    Ns_rpm     = (120 * f) / P;              
    omega_sync = (4 * pi * f) / P;            
    
    % Thevenin Equivalent Circuit
    Z_source = R1 + 1j * X1;
    Z_mag    = 1j * Xm;
    Z_th     = (Z_source * Z_mag) / (Z_source + Z_mag);
    R_th     = real(Z_th);                    
    X_th     = imag(Z_th);                   
    V_th     = abs(V_ph * (Z_mag / (Z_source + Z_mag))); 
    
    %% TORQUE-SPEED VECTOR COMPUTATION
    N_rpm   = linspace(0, Ns_rpm, 1000);      
    w_mech  = (2 * pi / 60) .* N_rpm;         
    s       = (Ns_rpm - N_rpm) ./ Ns_rpm;
    s(s == 0) = 1e-7;                        
    
    % Developed Electromagnetic Torque Equation
    numerator   = 3 * (V_th^2) .* (R2_prime ./ s);
    denominator = omega_sync .* ((R_th + (R2_prime ./ s)).^2 + (X_th + X2_prime)^2);
    T_dev       = numerator ./ denominator;  
    
    %% KEY CHARACTERISTIC POINTS CALCULATION
    % Locked Rotor / Starting Point
    s_start  = 1.0;
    N_start  = 0.0;
    T_start  = (3 * (V_th^2) * R2_prime) / ...
               (omega_sync * ((R_th + R2_prime)^2 + (X_th + X2_prime)^2));
               
    % Maximum / Breakdown Point
    s_max    = R2_prime / sqrt(R_th^2 + (X_th + X2_prime)^2);
    N_max    = (1 - s_max) * Ns_rpm;
    T_max    = (3 * (V_th^2)) / ...
               (2 * omega_sync * (R_th + sqrt(R_th^2 + (X_th + X2_prime)^2)));
               
    % Rated / Full-Load Operating Point
    N_fl     = (1 - s_rated) * Ns_rpm;
    w_fl     = (1 - s_rated) * omega_sync;
    T_fl     = (3 * (V_th^2) * (R2_prime / s_rated)) / ...
               (omega_sync * ((R_th + (R2_prime / s_rated))^2 + (X_th + X2_prime)^2));
               
    % Pull-Up Torque
    accel_mask = (N_rpm >= 0) & (N_rpm <= N_max);
    [T_pullup, idx_pu] = min(T_dev(accel_mask));
    N_pullup = N_rpm(idx_pu);
    
    %% OUTPUT TO CONSOLE
    
    fprintf('    THREE-PHASE INDUCTION MOTOR PERFORMANCE SUMMARY    \n');
   ;
    fprintf(' Supply Voltage (Line-Line) : %.1f V (%s-Connected)\n', V_line, connection);
    fprintf(' Phase Voltage (V_ph)       : %.2f V\n', V_ph);
    fprintf(' Synchronous Speed (Ns)     : %.1f RPM (%.2f rad/s)\n', Ns_rpm, omega_sync);
    fprintf('-------------------------------------------------------\n');
    fprintf(' CRITICAL TORQUE VALUES:\n');
    fprintf('  1. Locked-Rotor / Start   : %6.2f N.m  (at N = 0 RPM)\n', T_start);
    fprintf('  2. Pull-Up Torque         : %6.2f N.m  (at N = %.1f RPM)\n', T_pullup, N_pullup);
    fprintf('  3. Breakdown / Pull-Out   : %6.2f N.m  (at N = %.1f RPM)\n', T_max, N_max);
    fprintf('  4. Full-Load (Rated)      : %6.2f N.m  (at N = %.1f RPM)\n', T_fl, N_fl);
    fprintf('=======================================================\n');
    
    %% PUMP FLOW RATE DATA COMPUTATION
    N_pump_rated = 1425;    
    Q_rated_Lps  = 10.0;    
    
    Q_array_Lps = Q_rated_Lps .* (N_rpm ./ N_pump_rated);
    Q_start_Lps = 0.0;
    Q_at_Tmax_Lps = Q_rated_Lps * (N_max / N_pump_rated);
    Q_at_Tmax_m3h = Q_at_Tmax_Lps * 3.6;
    Q_at_fl_Lps   = Q_rated_Lps * (N_fl / N_pump_rated);
    Q_at_fl_m3h   = Q_at_fl_Lps * 3.6;
    Q_at_sync_Lps = Q_rated_Lps * (Ns_rpm / N_pump_rated);
    
    %% APP INTERFACE GENERATION
    % Create the main app window
    appFig = uifigure('Name', 'Motor & Pump Dashboard', 'Position', [300, 300, 400, 250], 'Color', [0.95 0.95 0.95]);
    
    % Title Label
    uilabel(appFig, 'Text', 'Motor & Pump Characteristics', ...
            'FontSize', 16, 'FontWeight', 'bold', 'HorizontalAlignment', 'center', ...
            'Position', [50, 180, 300, 40]);
            
    % Button 1: Torque-Speed Characteristic
    uibutton(appFig, 'push', 'Text', 'View Torque-Speed Curve', ...
             'FontSize', 14, 'Position', [75, 110, 250, 45], ...
             'ButtonPushedFcn', @(btn,event) plot_torque_speed());
             
    % Button 2: Flow Rate Characteristic
    uibutton(appFig, 'push', 'Text', 'View Pump Flow Rate Curve', ...
             'FontSize', 14, 'Position', [75, 45, 250, 45], ...
             'ButtonPushedFcn', @(btn,event) plot_flow_rate());

    %% NESTED PLOTTING FUNCTIONS
    function plot_torque_speed()
        figure('Color', [1 1 1], 'Position', [100, 100, 950, 600], 'Name', 'Torque-Speed Characteristic');
        axes; hold on; box on;
        
        plot(N_rpm, T_dev, 'LineWidth', 2.8, 'Color', [0.08, 0.35, 0.70]);
        
        speed_fractions = [0.20, 0.40, 0.60, 0.80];
        for k = 1:length(speed_fractions)
            spd_val = speed_fractions(k) * Ns_rpm;
            T_val   = interp1(N_rpm, T_dev, spd_val);
            plot([spd_val, spd_val], [0, T_val], '--', 'Color', [0.45 0.55 0.70], 'LineWidth', 1.3);
        end
        
        plot([N_fl, N_fl], [0, T_fl], ':', 'Color', [0.2 0.7 0.2], 'LineWidth', 1.4);
        plot([Ns_rpm, Ns_rpm], [0, max(T_dev)*1.05], '-.', 'Color', [0.8 0.2 0.2], 'LineWidth', 1.2);
        plot([0, Ns_rpm * 1.05], [0, 0], 'k-', 'LineWidth', 1.2);
        
        plot(N_start,  T_start,  'o', 'MarkerSize', 8, 'MarkerFaceColor', [0.85 0.2 0.2], 'MarkerEdgeColor', 'k');
        plot(N_pullup, T_pullup, 'o', 'MarkerSize', 8, 'MarkerFaceColor', [0.95 0.5 0.1], 'MarkerEdgeColor', 'k');
        plot(N_max,    T_max,    'o', 'MarkerSize', 9, 'MarkerFaceColor', [0.10 0.65 0.2], 'MarkerEdgeColor', 'k');
        plot(N_fl,     T_fl,     'o', 'MarkerSize', 8, 'MarkerFaceColor', [0.55 0.15 0.8], 'MarkerEdgeColor', 'k');
        plot(Ns_rpm,   0,        's', 'MarkerSize', 8, 'MarkerFaceColor', [0.20 0.20 0.2], 'MarkerEdgeColor', 'k');
        
        text(N_start + 15, T_start + (0.05 * T_max), sprintf('\\bf Locked Rotor\n(T_{start} = %.1f N\\cdotm)', T_start), 'FontSize', 10, 'Color', [0.7 0.1 0.1]);
        text(N_pullup + 25, T_pullup - (0.08 * T_max), sprintf('\\bf Pull-Up\n(%.1f N\\cdotm)', T_pullup), 'FontSize', 10, 'Color', [0.8 0.4 0.0]);
        text(N_max - (0.18 * Ns_rpm), T_max + (0.04 * T_max), sprintf('\\bf Breakdown Torque\n(T_{max} = %.1f N\\cdotm @ %.0f RPM)', T_max, N_max), 'FontSize', 10, 'Color', [0.0 0.5 0.1]);
        text(N_fl - (0.12 * Ns_rpm), T_fl + (0.10 * T_max), sprintf('\\bf Full Load\n(T_{FL} = %.1f N\\cdotm @ %.0f RPM)', T_fl, N_fl), 'FontSize', 10, 'Color', [0.45 0.1 0.7]);
        
        xticks([0, 0.20*Ns_rpm, 0.40*Ns_rpm, 0.60*Ns_rpm, 0.80*Ns_rpm, N_fl, Ns_rpm]);
        xticklabels({'0', '20%', '40%', '60%', '80%', 'N (Rated)', 'N_s'});
        xlim([-10, Ns_rpm * 1.06]); ylim([0, T_max * 1.18]);
        
        xlabel('Rotor Speed N (RPM)', 'FontSize', 12, 'FontWeight', 'bold');
        ylabel('Developed Torque (N.m)', 'FontSize', 12, 'FontWeight', 'bold');
        title({'\bf Three-Phase Induction Motor Torque-Speed Characteristic', sprintf('\\rm V_{line} = %.0f V, f = %.0f Hz', V_line, f)}, 'FontSize', 13);
        grid on; set(gca, 'FontSize', 10, 'LineWidth', 1.1);
        
        annotation_str = {sprintf('\\bfMachine & Winding Data:'), sprintf('• Stator Slots: %d | Turns/Slot: %d', stator_slots, turns_per_slot), sprintf('• Wire: SWG %d | Stator ID/OD: %.1f / %.1f cm', wire_gauge_SWG, stator_ID_cm, stator_OD_cm)};
        annotation('textbox', [0.15 0.16 0.32 0.18], 'String', annotation_str, 'FitBoxToText', 'on', 'BackgroundColor', [0.96 0.97 1.0], 'FontSize', 9);
        hold off;
    end

    function plot_flow_rate()
        figure('Color', [1 1 1], 'Position', [180, 180, 880, 520], 'Name', 'Pump Speed vs Flow Rate');
        hold on; box on;
        
        plot(N_rpm, Q_array_Lps, 'LineWidth', 2.6, 'Color', [0.0, 0.45, 0.75], 'DisplayName', 'Flow Rate Q(N) \propto \omega');
        plot(0, Q_start_Lps, 'ro', 'MarkerSize', 9, 'MarkerFaceColor', 'r', 'DisplayName', 'At Standstill');
        plot(N_max, Q_at_Tmax_Lps, 'go', 'MarkerSize', 9, 'MarkerFaceColor', [0.1 0.7 0.2], 'DisplayName', sprintf('At Max Torque T_{max}'));
        plot(N_fl, Q_at_fl_Lps, 'mo', 'MarkerSize', 9, 'MarkerFaceColor', [0.7 0.1 0.7], 'DisplayName', sprintf('At Rated Speed N_{FL}'));
        plot(Ns_rpm, Q_at_sync_Lps, 'ks', 'MarkerSize', 8, 'MarkerFaceColor', [0.3 0.3 0.3], 'DisplayName', sprintf('At Synchronous Speed N_s'));
        
        plot([N_max, N_max], [0, Q_at_Tmax_Lps], 'g:', 'LineWidth', 1.3, 'HandleVisibility', 'off');
        plot([N_fl, N_fl],   [0, Q_at_fl_Lps],   'm:', 'LineWidth', 1.3, 'HandleVisibility', 'off');
        plot([0, N_max],     [Q_at_Tmax_Lps, Q_at_Tmax_Lps], 'g:', 'LineWidth', 1.3, 'HandleVisibility', 'off');
        plot([0, N_fl],      [Q_at_fl_Lps, Q_at_fl_Lps],     'm:', 'LineWidth', 1.3, 'HandleVisibility', 'off');
        
        text(N_max - 260, Q_at_Tmax_Lps + 0.55, sprintf('\\bf 2. At Max Torque\nN = %.1f RPM\nQ = %.2f L/s', N_max, Q_at_Tmax_Lps), 'FontSize', 9.5, 'BackgroundColor', [1 1 1 0.85], 'EdgeColor', [0.1 0.7 0.2]);
        text(N_fl - 240, Q_at_fl_Lps - 0.55, sprintf('\\bf 3. At Rated Speed\nN = %.1f RPM\nQ = %.2f L/s', N_fl, Q_at_fl_Lps), 'FontSize', 9.5, 'BackgroundColor', [1 1 1 0.85], 'EdgeColor', [0.7 0.1 0.7]);
        
        xlim([0, Ns_rpm * 1.05]); ylim([0, max(Q_array_Lps) * 1.15]);
        xlabel('Motor Shaft Speed N (RPM) ', 'FontSize', 11, 'FontWeight', 'bold');
        ylabel('Discharge Flow Rate Q (Liters/second)', 'FontSize', 11, 'FontWeight', 'bold');
        title({'\bf Centrifugal Water Pump: Speed vs. Flow Rate Characteristic', '\rm Volumetric Discharge Directly Proportional to Rotational Speed (Q \propto \omega)'}, 'FontSize', 12);
        grid on; legend('Location', 'northwest', 'FontSize', 9.5);
        hold off;
    end
end