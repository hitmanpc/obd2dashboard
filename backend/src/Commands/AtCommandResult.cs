namespace ObdDashboard.Commands
{
    /// <summary>
    /// Represents the result of an AT command execution.
    /// </summary>
    /// <remarks>
    /// Contains success status, response data, and error information
    /// for comprehensive command result handling.
    /// </remarks>
    public class AtCommandResult
    {
        /// <summary>
        /// Gets or sets whether the command executed successfully.
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// Gets or sets the cleaned response from the ELM327 adapter.
        /// </summary>
        public string Response { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the error message if the command failed.
        /// </summary>
        public string ErrorMessage { get; set; } = string.Empty;
    }
}