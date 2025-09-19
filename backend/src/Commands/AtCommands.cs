namespace ObdDashboard.Commands
{
    /// <summary>
    /// Common AT commands for ELM327 OBD-II adapter communication.
    /// </summary>
    /// <remarks>
    /// These commands are used to communicate with the ELM327 adapter.
    /// See ELM327 documentation for details: https://cdn.sparkfun.com/assets/4/e/5/0/2/ELM327_AT_Commands.pdf
    /// Documentation is not always accurate or complete but it was the best available reference at the time of coding.
    /// </remarks>
    public static class AtCommands
    {
        /// <summary>Reset the ELM327 adapter to default settings.</summary>
        public const string Reset = "ATZ";
        
        /// <summary>Request adapter identification string.</summary>
        public const string Identity = "ATI";
        
        /// <summary>Turn off command echo.</summary>
        public const string EchoOff = "ATE0";
        
        /// <summary>Turn off linefeeds in responses.</summary>
        public const string LinefeedsOff = "ATL0";
        
        /// <summary>Turn off spaces in responses.</summary>
        public const string SpacesOff = "ATS0";
        
        /// <summary>Turn off headers in responses.</summary>
        public const string HeadersOff = "ATH0";
        
        /// <summary>Set protocol to automatic detection.</summary>
        public const string ProtocolAuto = "ATSP0";
        
        /// <summary>Read adapter supply voltage.</summary>
        public const string Voltage = "ATRV";
        
        /// <summary>Describe current protocol.</summary>
        public const string DescribeProtocol = "ATDP";
        
        /// <summary>Describe protocol by number.</summary>
        public const string DescribeProtocolNumber = "ATDPN";
        
        /// <summary>Close current protocol.</summary>
        public const string CloseProtocol = "ATPC";
    }
}